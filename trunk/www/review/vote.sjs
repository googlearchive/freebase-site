/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var reviewHelpers = acre.require('reviewhelpers.sjs');
var h = acre.require('lib/helper/helpers.sjs');
var apis = acre.require('lib/promise/apis.sjs');
var freeq = acre.require('lib/freeq/queries.sjs');
var freebase = apis.freebase;
var deferred = apis.deferred;
var i18n = acre.require('lib/i18n/i18n.sjs');
var _ = i18n.gettext;

// freebase review constants
var mergeId = '/m/092s5_x';
var splitId = '/m/092s606';
var deleteId = '/m/092s5_r';
var offensiveId = '/m/092s601';
var agreeVote = '/m/092s60c';
var disagreeVote = '/m/092s60j';
var skipVote = '/m/092s60p';
var freebaseExperts = '/m/0432s8d';
var pipelineAdmins = '/m/03p3rjs';

// processVote constants
var SUCCESS = 'Vote recorded.';
var MISSING_PARAMS = 'Missing parameters.';
var INVALID_USER = 'Invalid user parameter.';
var INVALID_VOTE = 'Invalid vote.';
var INVALID_FLAG = 'MID did not match a flag.';
var INVALID_ITEM = 'Item supplied is not an option for flag.';
var MALFORMED_FLAG = 'Malformed flag.';
var LOW_PERMISSION = 'User does not have permission.';
var VOTE_ON_OWN_FLAG = 'User can not vote on own flag.';

// processFlag constants
var INSUFFICIENT_VOTES = 'Insufficient votes to process';
var CONFLICTING_VOTES = 'Conflicting votes. Escalated to admin queue.';
var ERROR_ESCALATING = 'Error escalating flag ';
var CONSENSUS_OF_VOTES = 'Consensus reached. Action being performed.';
var LANG_IN_REVIEW = 'Found lang object in review. Escalating.';
var SCHEMA_IN_REVIEW = 'Found schema object in review. Escalating.';
var BIG_LINKS_REVIEW = 'Escalating flag due to high link count.';

// executeVote constants
var PROMISE_OK = 'Resolved promise';




function processVote(flag, vote, item, user) {
    var flagInfo;
    var userInfo;

    if (!user || !vote || !flag) {
        return deferred.rejected(MISSING_PARAMS);
    }
    if (vote !== 'agree' && vote !== 'disagree' && vote !== 'skip') {
        return deferred.rejected(INVALID_VOTE);
    }

    // Touch here to get the latest data
    return freebase.touch().then(function(){
        return reviewHelpers.getFlagAndUserInfo(flag, user);
    }).then(function(results) {
        flagInfo = results[0];
        userInfo = results[1];
        // Authenitcate user
        if (reviewHelpers.userOwnsFlag(flagInfo, userInfo)) {
            return deferred.rejected(VOTE_ON_OWN_FLAG);
        }
        if (!reviewHelpers.userCanVoteForFlag(flagInfo, userInfo)) {
            return deferred.rejected(LOW_PERMISSION);
        }

        // Authenticate item, if neccesary
        if (reviewHelpers.getFlagKind(flagInfo) === 'merge' && vote === 'agree') {
            if (!item) {
                return deferred.rejected(MISSING_PARAMS);
            } else {
                var items = reviewHelpers.getFlagItems(flagInfo);
                if (items[0].id !== item && items[1].id !== item) {
                    return deferred.rejected(INVALID_ITEM);
                }
            }
        }
        // Remove any previous votes, if neccesary
        var promise = null;
        var judgments = reviewHelpers.getFlagVotes(flagInfo);
        if (judgments) {
            judgments.forEach(function(judgment) {
                if (judgment.creator == user.id) {
                    promise = reviewHelpers.deleteEntity(judgment.id);
                }
            });
        }

        if (!promise) {
          promise = deferred.resolved(null);
        }
        return promise;

    }).then(function(result) {
        // Ready to write vote
        if (vote !== 'agree' || h.get_first_value(flagInfo, '/freebase/review_flag/kind').id !== mergeId) {
            item = null;
        }
        return reviewHelpers.createVoteQuery(flag, vote, item);

    }).then(function(result) {

        if (h.has_value(flagInfo, '/freebase/review_flag/status')) {
            // DO ADMIN VOTING

            // We need to refresh flagInfo to get the latest (admin's) vote
            return reviewHelpers.getAndValidateFlagInfo(flag)
                .then(function(result){
                    var flagInfo = result;

                    // Find admin's judgement
                    var judgement;
                    var judgements = reviewHelpers.getFlagVotes(flagInfo);
                    if (judgements) {
                        judgements.forEach(function(judg) {
                            if (judg.creator == user.id) {
                                judgement = judg;
                            }
                        });
                        return executeVote(flagInfo, [judgement]);
                    } else {
                        return deferred.rejected(INVALID_ITEM);
                    }
                });
        } else {
            var judgements = reviewHelpers.getFlagVotes(flagInfo);
            if (judgements && judgements.length > 2) {
                return processFlag(flag);
            }
            return deferred.resolved(PROMISE_OK);
        }

    }).then(function(result) {
        return deferred.resolved(SUCCESS);
    });
}

/**
 * Execute Vote actions
 *
 */
function executeVote(flagInfo, verifiedJudgements) {
    h.enable_writeuser();

    var flagKind = reviewHelpers.getFlagKind(flagInfo);

    var flagItems = reviewHelpers.getFlagItems(flagInfo);
    var judgements = verifiedJudgements || reviewHelpers.getFlagVotes(flagInfo);

    var judgementVote = h.get_first_value(judgements[0],
        '/freebase/flag_judgment/vote');
    var judgementItem = h.get_first_value(judgements[0],
        '/freebase/flag_judgment/item');

    if (!flagItems || !flagItems.length) return deferred.rejected(INVALID_ITEM);
    var promise;

    // Is vote agree?
    if (judgementVote.id === agreeVote) {
        switch(flagKind) {
            case "merge": // call FreeQ
                var id_target, id_source;
                if (judgementItem.id === flagItems[0].id) {
                    id_target = flagItems[0].id;
                    id_source = flagItems[1].id;
                } else if (judgementItem.id === items[1].id) {
                    id_target = flagItems[1].id;
                    id_source = flagItems[0].id;
                } else {
                    return deferred.rejected(INVALID_ITEM);
                }
                promise = freeq.merge_topics(null, id_target, id_source, true);
                break;

            case "delete": // call FreeQ
                var topic_id = flagItems[0].id;
                promise = freeq.delete_topic(null, topic_id, true);
                break;

            case "offensive": // we don't do anything for offensive for now
                return deferred.resolved(PROMISE_OK);

            case "split": // we don't do anything for split for now
                return deferred.resolved(PROMISE_OK);
        }
    } else if (judgementVote.id !== disagreeVote) {
        // Vote is Skip or error
        return deferred.resolved(PROMISE_OK);
    }

    promise = promise || deferred.resolved(PROMISE_OK);

    // Delete flag and judgements
    return promise.then(function(){
        var promises = [];

        // delete all judgements
        var allJudgements = reviewHelpers.getFlagVotes(flagInfo);
        if (allJudgements) {
            allJudgements.forEach(function(judgement) {
                promises.push(reviewHelpers.deleteEntity(judgement.id));
            });
        }
        // delete flag
        promises.push(reviewHelpers.deleteEntity(flagInfo.id));

        return deferred.all(promises).then(function(result){
            return deferred.resolved(PROMISE_OK);
        });
    });
}

function processFlag(mid) {
    return reviewHelpers.getAndValidateFlagInfo(mid).then(function(result){
        var flagInfo = result;

        // Check if there are more than 2 votes
        var flagJudgments = reviewHelpers.getFlagVotes(flagInfo);
        if (!flagJudgments || flagJudgments.length < 3) {
            return deferred.resolved(INSUFFICIENT_VOTES);
        }

        var flagItems = reviewHelpers.getFlagItems(flagInfo);
        var flagCreator = reviewHelpers.getFlagCreator(flagInfo);

        // Topic api returns in reverse chronological - (earliest first)
        // Sort by creator, then by reverse chronological
        var sortedJudgments = flagJudgments.slice(0);
        sortedJudgments.sort(function(judgment1, judgment2) {

            var creator1 = judgment1.creator;
            var creator2 = judgment2.creator;

            if (creator1 === creator2) {
                return (flagJudgments.indexOf(judgment1) > flagJudgments.indexOf(judgment2)) ? 1 : -1;
            } else {
                return (creator1 > creator2) ? 1 : -1;
            }
        });

        // Get valid judgments
        var verifiedJudgments = [];
        for (var i = 0, l = sortedJudgments.length - 1; i < l; i++) {

            var vote1 = h.get_first_value(sortedJudgments[i], '/freebase/flag_judgment/vote').id;
            var creator1 = sortedJudgments[i].creator;
            var creator2 = sortedJudgments[i + 1].creator;

            if (creator1 !== flagCreator && creator1 !== creator2) {
                if (vote1 && vote1 != skipVote) {
                    verifiedJudgments.push(sortedJudgments[i]);
                }
            }
        }
        var vote1 = h.get_first_value(sortedJudgments[sortedJudgments.length - 1], '/freebase/flag_judgment/vote').id;
        var creator1 = sortedJudgments[sortedJudgments.length - 1].creator;
        if (creator1 !== flagCreator) {
            if (vote1 && vote1 != skipVote) {
                verifiedJudgments.push(sortedJudgments[i]);
            }
        }

        // Check and tally the votes
        if (verifiedJudgments.length < 3) {
            return deferred.resolved(INSUFFICIENT_VOTES);
        }
        // Check for unanimous-ness
        var voteDirections = [0, 0, 0, 0];
        verifiedJudgments.forEach(function(judgment) {
            var vote1 = h.get_first_value(judgment, '/freebase/flag_judgment/vote');
            var item1 = h.get_first_value(judgment, '/freebase/flag_judgment/item');

            if (item1 && flagItems[0] && item1 === flagItems[0].id) {
                voteDirections[0] = 1;
            } else if (item1 && flagItems[1] && item1 === flagItems[1].id) {
                voteDirections[1] = 1;
            } else if (vote1.id === agreeVote) {
                voteDirections[2] = 1;
            } else if (vote1.id === disagreeVote) {
                voteDirections[3] = 1;
            }
        });
        voteDirections = voteDirections[0] + voteDirections[1] + voteDirections[2] + voteDirections[3];
        if (voteDirections > 1) {
            // Conflicting :(
            return reviewHelpers.escalateFlagTo(flagInfo.id, 'conflicting').then(function(env) {
                return deferred.resolved(CONFLICTING_VOTES);
            });
        } else {
            // Concensus!

            // Do some more checks...
            var itemOptions = {
                'filter': [
                    '/freebase/object_profile/linkcount',
                    '/type/object/type'
                ]
            };
            var itemMids = flagItems.map(function(item) { return item.id; });
            var itemPromises = [];
            for (var i = 0, l = itemMids.length; i < l; i++) {
                itemPromises.push(freebase.get_topic(itemMids[i], itemOptions));
            }
            return deferred.all(itemPromises).then(function(results) {
                for (var i = 0, l = results.length; i < l; i++) {

                    // Failed topic lookup checking
                    var item = results[i];
                    if (!item || item.errors || !item.id) {
                        return deferred.rejected(MALFORMED_FLAG);
                    }

                    // No direct voting on things with more than 200 links or things in "/lang"
                    var total = 0;
                    var links = h.get_values(item, '/freebase/object_profile/linkcount');
                    for (var i = 0, l = links.length; i < l; i++) {
                        linkType = links[i];
                        if (linkType.id === '/lang') {
                            return reviewHelpers.escalateFlagTo(flagInfo.id, 'system').then(function(env) {
                                return deferred.rejected(LANG_IN_REVIEW);
                            });
                        } else {
                            total += linkType.count;
                        }
                    }
                    if (total > 200) {
                        return reviewHelpers.escalateFlagTo(flagInfo.id, 'significant').then(function(env) {
                            return deferred.rejected(BIG_LINKS_REVIEW);
                        });
                    }

                    // No direct voting on schema objects
                    var types = h.get_values(item, '/type/object/type');
                    for (var i = 0, l = types.length; i < l; i++) {
                        if (h.is_metaweb_system_type(types[0].id)) {
                            return reviewHelpers.escalateFlagTo(flagInfo.id, 'system').then(function(env) {
                                return deferred.rejected(SCHEMA_IN_REVIEW);
                            });
                        }
                    }
                }

                return executeVote(flagInfo, verifiedJudgments);
            });
        }
    });
}

