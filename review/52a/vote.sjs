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
var success = _('Vote recorded.');
var missingParams = _('Missing parameters.');
var invalidUser = _('Invalid user parameter.');
var invalidVote = _('Invalid vote.');
var invalidFlag = _('MID did not match a flag.');
var invalidItem = _('Item supplied is not an option for flag.');
var malformedFlag = _('Malformed flag.');
var lowPermission = _('User does not have permission.');
var voteOnOwnFlag = _('User can not vote on own flag.');

// processFlag constants
var insufficientVotes = _('Insufficient votes to process');
var conflictingVotes = _('Conflicting votes. Escalated to admin queue.');
var errorEscalating = _('Error escalating flag: ');
var consensusOfVotes = _('Consensus reached. Action being performed.');
var langInReview = _('Found lang object in review. Escalating.');
var schemaInReview = _('Found schema object in review. Escalating.');
var bigLinksReview = _('Escalating flag due to high link count.');

function processVote(flag, vote, item, user) {

    var flagInfo;
    var userInfo;

    if (!user || !vote || !flag) {
        return deferred.rejected(missingParams);
    }
    if (vote !== 'agree' && vote !== 'disagree' && vote !== 'skip') {
        return deferred.rejected(invalidVote);
    }

    return reviewHelpers.getFlagAndUserInfo(flag, user).then(function(results) {

        flagInfo = results[0];
        userInfo = results[1];

        // Authenitcate user
        if (reviewHelpers.userOwnsFlag(flagInfo, userInfo)) {
            return deferred.rejected(voteOnOwnFlag);
        }
        if (!reviewHelpers.userCanVoteForFlag(flagInfo, userInfo)) {
            return deferred.rejected(lowPermission);
        }

        // Authenticate item, if neccesary
        if (reviewHelpers.getFlagKind(flagInfo) === 'merge' && vote === 'agree') {
            if (!item) {
                return deferred.rejected(missingParams);
            } else {
                var items = reviewHelpers.getFlagItems(flagInfo);
                if (items[0].id !== item && items[1].id !== item) {
                    return deferred.rejected(invalidItem);
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
            return deferred.resolved('empty promise to contine');
        } else {
            return promise;
        }

    }).then(function(result) {

        // Ready to write vote
        if (vote !== 'agree' || h.get_first_value(flagInfo, '/freebase/review_flag/kind').id !== mergeId) {
            item = null;
        }
        return reviewHelpers.createVoteQuery(flag, vote, item);

    }).then(function(result) {

        if (h.has_value(flagInfo, '/freebase/review_flag/status')) {

            // ADMIN VOTING, DO FREEQ STUFF HERE
            return deferred.resolved('Empty promise for freeq');

        } else {
            var judgments = reviewHelpers.getFlagVotes(flagInfo);
            if (judgments && judgments.length > 2) {
                return processFlag(flag);
            }
            return deferred.resolved('Empty promise to continue');
        }

    }).then(function(result) {
        return deferred.resolved(success);
    });
}

function processFlag(mid) {


    return freebase.get_topic(mid, reviewHelpers.flagOptions).then(function(result) {

        // Error checking
        if (!result || result.errors || !result.id) {
            return deferred.rejected(invalidFlag);
        }
        if (!reviewHelpers.isFlagFromTopic(result)) {
            return deferred.rejected(invalidFlag);
        }
        if (!reviewHelpers.validFlagFromTopic(result)) {
            return deferred.rejected(malformedFlag);
        }

        var flagInfo = result;

        // Check if there are more than 2 votes
        var flagJudgments = reviewHelpers.getFlagVotes(flagInfo);
        if (!flagJudgments || flagJudgments.length < 3) {
            return deferred.resolved(insufficientVotes);
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
            return deferred.resolved(insufficientVotes);
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
                return deferred.resolved(conflictingVotes);
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
                        return deferred.rejected(malformedFlag);
                    }

                    // No direct voting on things with more than 200 links or things in "/lang"
                    var total = 0;
                    var links = h.get_values(item, '/freebase/object_profile/linkcount');
                    for (var i = 0, l = links.length; i < l; i++) {
                        linkType = links[i];
                        if (linkType.id === '/lang') {
                            return reviewHelpers.escalateFlagTo(flagInfo.id, 'system').then(function(env) {
                                return deferred.rejected(langInReview);
                            });
                        } else {
                            total += linkType.count;
                        }
                    }
                    if (total > 200) {
                        return reviewHelpers.escalateFlagTo(flagInfo.id, 'significant').then(function(env) {
                            return deferred.rejected(bigLinksReview);
                        });
                    }

                    // No direct voting on schema objects
                    var types = h.get_values(item, '/type/object/type');
                    for (var i = 0, l = types.length; i < l; i++) {
                        if (h.is_metaweb_system_type(types[0].id)) {
                            return reviewHelpers.escalateFlagTo(flagInfo.id, 'system').then(function(env) {
                                return deferred.rejected(schemaInReview);
                            });
                        }
                    }
                }

                // DO FREEQ STUFF HERE
                return deferred.resolved(consensusOfVotes);

            });
        }
    });
}

