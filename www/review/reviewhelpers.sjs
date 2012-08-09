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

var h = acre.require('lib/helper/helpers.sjs');
var freebase = acre.require('lib/promise/apis.sjs').freebase;
var deferred = acre.require('lib/promise/apis.sjs').deferred;
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

var invalidUser = _('Invalid user parameter.');
var invalidFlag = _('MID did not match a flag.');

var flagOptions = {
    'filter': [
        '/freebase/review_flag/',
        '/freebase/flag_judgment/',
        '/freebase/object_profile/',
        '/type/object/attribution',
        '/type/object/type'
    ]
};
var userOptions = {
    'filter': [
        '/type/user/usergroup'
    ]
};

// Make sure to change in user/edit_group_submit.ajax also
var cachedUserKey = 'review_user_cached_';

// Function to fetch flag and user topics
// while caching the user
function getFlagAndUserInfo(flag, user) {

    var flagInfo;
    var userInfo;

    var flagTopic = freebase.get_topic(flag, flagOptions);

    var userWasCached = true;
    var userTopic = acre.cache.get(cachedUserKey + user.id);
    if (userTopic) {
        userTopic = deferred.resolved(userTopic);
    } else {
        userTopic = freebase.get_topic(user.id, userOptions);
        userWasCached = false;
    }

    return deferred.all([flagTopic, userTopic]).then(function(results) {

        // Error checking
        if (!results[0] || results[0].errors || !results[0].id) {
            return deferred.rejected(invalidFlag);
        } else {
            flagInfo = results[0];
        }
        if (!results[1] || results[1].errors || !results[1].id) {
            return deferred.rejected(invalidUser);
        } else {
            userInfo = results[1];
        }

        // Caching
        if (!userWasCached) {
            acre.cache.put(cachedUserKey + user.id, results[1], 100000);
        }

        // Validating Flag
        if (!isFlagFromTopic(flagInfo)) {
            return deferred.rejected(invalidFlag);
        }
        if (!validFlagFromTopic(flagInfo)) {
            return deferred.rejected(malformedFlag);
        }

        return deferred.resolved(results);
    });
}

// Checks a direct result from freebase.get_topic for review flag type
function isFlagFromTopic(result) {
    var types = h.get_values(result, '/type/object/type');
    for (var i = 0, l = types.length; i < l; i++) {
        if (types[i].id === '/freebase/review_flag') {
            return true;
        }
    }
    return false;
}

// Validates a flag from the direct results of a topic api lookup
function validFlagFromTopic(result) {

    var malformed = true;
    var items = h.get_values(result, '/freebase/review_flag/item');
    var kind = h.get_first_value(result, '/freebase/review_flag/kind');

    if (items && kind) {
        var validFlagKinds = ['/m/092s606', '/m/092s5_r', '/m/092s5_x', '/m/092s601'];
        if (validFlagKinds.indexOf(kind.id) !== -1) {
            malformed = false;
        }
    }
    return !malformed;
}

// Returns readable form of flag kind
function getFlagKind(flagInfo) {
    var kind = h.get_first_value(flagInfo, '/freebase/review_flag/kind').id;
    if (kind === mergeId) {
        return 'merge';
    } else if (kind === splitId) {
        return 'split';
    } else if (kind === offensiveId) {
        return 'offensive';
    } else if (kind === deleteId) {
        return 'delete';
    } else {
        return null;
    }
}

// Returns creator of flag from attribution
function getFlagCreator(flagInfo) {
    var creator = h.get_first_value(flagInfo, '/type/object/attribution');
    if (!creator) {
        return null;
    } else {
        return creator.id;
    }
}

// Returns flag judgments of a flag
function getFlagVotes(flagInfo) {
    return h.get_values(flagInfo, '/freebase/review_flag/judgments');
}

// Returns flag items of a flag
function getFlagItems(flagInfo) {
    return h.get_values(flagInfo, '/freebase/review_flag/item');
}

// Checks if user is the creator in attribution node
function userOwnsFlag(flagInfo, userInfo) {
    if (getFlagCreator(flagInfo) === userInfo.id) {
          return true;
    }
    return false;
}

// Checks if user has permission to vote on a flag
function userCanVoteForFlag(flagInfo, userInfo) {
    if (h.has_value(flagInfo, '/freebase/review_flag/status')) {
        if (h.has_value(userInfo, '/type/user/usergroup')) {
            var groups = h.get_values(userInfo, '/type/user/usergroup');
            for (var i = 0, l = groups.length; i < l; i++) {
                if (groups[i].id === freebaseExperts || groups[i].id === pipelineAdmins) {
                    return true;
                }
            }
        }
        return false;
    }
    return true;
}

// Escalates a flag to admin queue by using given status.
function escalateFlagTo(flag, status) {
    var query = {
        'mid': flag,
        'type': '/freebase/review_flag',
        'status': {
            'type': '/freebase/flag_status',
            'key': {
                    'value': 'conflicting',
                    'namespace': '/freebase/flag_status'
            },
            'connect': 'update'
        }
    };
    return freebase.mqlwrite(query).then(function(env) {
        return env.result;
    });
}

// Returns promise with results of casting a vote
function createVoteQuery(flag, vote, item) {
    var voteQuery = {
        'type': '/freebase/flag_judgment',
        'vote': {
            'type': '/freebase/flag_vote',
            'key': {
                    'value': vote,
                    'namespace': '/freebase/flag_vote'
            },
            'connect': 'update'
        },
        'flag': {
            'mid': flag,
            'connect': 'update'
        },
        'create': 'unconditional'
    };
    if (item) {
        var mergePatch = { 'item': { 'mid': item, 'connect': 'update' } };
        acre.freebase.extend_query(voteQuery, mergePatch);
    }
    return freebase.mqlwrite(voteQuery).then(function(env) {
        return env.result;
    });
}

// Returns promise with data of all links of an object
function linksForDeleteQuery(mid) {
    var readLinks = [{
        'master_property': null,
        'source': {
            'mid': mid
        },
        'target': {
            'mid': null,
            'guid': null,
            'optional': true
        },
        'target_value': {},
        'type': '/type/link',
        'limit': 10000
    }];
    return freebase.mqlread(readLinks).then(function(env) {
        return env.result;
    });
}

// Returns promise for results of completely unlinking a object
function deleteEntity(mid) {

    return linksForDeleteQuery(mid).then(function(data) {

        if (!data) {
            return deferred.resolved('No links for MID ' + mid + ' found.');
        }

        var links = data;
        var promise = null;
        var deleteQuery = { 'mid': mid };

        for (var i = 0, l = links.length; i < l; i++) {
            var link = links[i];
            var prop = link.master_property;

            if (prop == '/type/object/permission') {
                continue;
            }
            prop = 'prop' + i + ':' + prop;

            if (link.target_value != null) {
                deleteQuery[prop] = link.target_value;
                deleteQuery[prop]['connect'] = 'delete';
            } else {
                deleteQuery[prop] = {
                    'guid': link.target.guid,
                    'connect': 'delete'
                };
            }
        }

        return freebase.mqlwrite(deleteQuery);

    }, function(error) {
        return deferred.resolved('Read links error: ' + error);
    });
}


