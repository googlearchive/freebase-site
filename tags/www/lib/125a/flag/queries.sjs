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

var h = acre.require('helper/helpers.sjs');
var apis = acre.require("promise/apis");
var freeq = acre.require("freeq/queries.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;

var KINDS = {
  "merge": "/freebase/flag_kind/merge",
  "split": "/freebase/flag_kind/split",
  "delete": "/freebase/flag_kind/delete",
  "offensive": "/freebase/flag_kind/offensive"
};

function flag(id) {
  var q = {
    id: id,
    type: "/freebase/review_flag",
    kind: {id: null},
    item: [{id: null}]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
}

function create(user, kind, id1/**, id2, ..., id_N **/) {

  var id_kind = KINDS[kind];
  if (!id_kind) {
    return {
      error: "Kind must be one of merge|split|delete|offensive"
    };
  }
  var ids = Array.prototype.slice.call(arguments, 2);
  // TODO: assert ids.length > 0
  if (!ids.length) {
    return {
      error: "A review flag requires at least one item"
    };
  }

  // ***** Auto delete/merge *****//

  return canAutoMergeOrDelete(ids[0], user).then(function(result) {
    if (result &&
        (kind === "merge" || kind === "delete") &&
        (ids.length < 3)) {

      var promise = null;
      var losingItem = ids[0];
      var winningItem = ids[1];

      // Enable writeuser for accessing FreeQ
      h.enable_writeuser();
      if (kind === "merge") {
        promise = freeq.merge_topics(null, winningItem, losingItem, true);
      } else if (kind === "delete") {
        promise = freeq.delete_topic(null, losingItem, true);
      } else {
        return {
          error: "Auto merge/delete failed, please try again."
        };
      }
      return promise.then(function(result){
        var actionType = kind === "merge" ? "automerged" : "autodeleted";
        return {
          info: "This object has been " + actionType
        };
      });

    } else {
      // Can't auto merge or delete, flag it
      var q = {
        id: null,
        type: "/freebase/review_flag",
        kind: {
            id: id_kind
        },
        item: [],
        create: "unless_exists"
      };
      ids.forEach(function(id) {
        q.item.push({id:id});
      });
      return freebase.mqlwrite(q).then(function(env) {
        return {
          info: "This object has been flagged and sent for review."
        };
      });
    }
  });
}

function undo(flag_id) {
  return flag(flag_id)
    .then(function(f) {
      if (f) {
        var q = {
          id: flag_id,
          type: {
            id: "/freebase/review_flag",
            connect: "delete"
          },
          "/freebase/review_flag/kind": {
            id: f.kind.id,
            connect: "delete"
          }
        };
        if (f.item) {
          var item = q["/freebase/review_flag/item"] = [];
          f.item.forEach(function(i) {
            item.push({id:i.id, connect:"delete"});
          });
        }
        return freebase.mqlwrite(q)
          .then(function(env) {
            return env.result;
          });
      }
      return f;
    });
}

function getResultNumber(env) {
  if (env && typeof env.result == 'number') {
    return env.result;
  } else {
    return Number.NaN;
  }
}

// Find linkcounts for object with id
function getLinkCount(id) {
  var promises = {};

  var target_count_query = {
    "type": "/type/link",
    "target": {
      "id": id
    },
    "return": "count"
  };

  var source_count_query = {
    "type": "/type/link",
    "source": {
      "id": id
    },
    "return": "count"
  };

  promises.target_count = freebase.mqlread(target_count_query)
    .then(getResultNumber);

  promises.source_count = freebase.mqlread(source_count_query)
    .then(getResultNumber);

  return deferred.all(promises).then(function(results){
    return results.source_count + results.target_count;
  }, function (err) {
    return Number.NaN;
  });
}

/**
 * Returns true if object with id can be automerged or autodeleted
 * @param {MqlId} id Id of an object
 * @param {MqlId} user Id of a user
 * @return {Boolean} true if can be automerged/autodeleted, false otherwise
 */
function canAutoMergeOrDelete(id, user) {
  // Can auto delete or merge if user is owner of losing topic
  // and its link count < 50

  // TODO(pmikota): Check whether the creator is also creator of all links
  var promises = {};

  var attribution_query = {
    "id": id,
    "attribution": null
  };

  promises.attribution = freebase.mqlread(attribution_query)
    .then(function(env) {
      return env.result ? env.result.attribution : null;
    }, function (err) {
      return null;
    });

  promises.linkcount = getLinkCount(id);

  return deferred.all(promises).then(function(results) {
    if (results.linkcount && results.attribution) {
      // number of links from and to losing item
      var linkcount = results.linkcount;
      var creator = results.attribution;

      if (linkcount < 50 && creator === user.id) {
        return true;
      }
    }
    return false;
  }, function(err){
    return false;
  });
}
