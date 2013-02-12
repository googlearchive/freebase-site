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

    // Can auto delete or merge if user is owner of losing topic
    // and its link count < 50
    var promises = [];
    var itemOptions = {
        "filter": [
            '/freebase/object_profile/linkcount',
            '/type/object/attribution'
        ]
    };
    ids.forEach(function(id){
        promises.push(freebase.get_topic(id, itemOptions));
    });
    return deferred.all(promises).then(function(results) {
        // TODO(pmikota): Check whether the creator is also creator of all links
        var losingItem, winningItem;
        var autoMergeDelete = false;
        for(var i = 0, l = results.length; i < l; i++) {
            var result = results[i];
            var creator = h.get_first_value(result, '/type/object/attribution');

            if (creator && creator.id === user.id) {
                var linkcount = h.link_count(result);
                if (linkcount !== -1 && linkcount < 50) {
                    if (kind === "merge") {
                        // First Assign Losing Item and then Winning Item
                        if (losingItem) {
                            winningItem = result.id;
                            autoMergeDelete = true;
                        } else {
                            losingItem = result.id;
                        }
                    } else if (kind === "delete") {
                        losingItem = result.id;
                        autoMergeDelete = true;
                    }
                }
            }
        }

        if (autoMergeDelete &&
            (kind === "merge" || kind === "delete") &&
            (ids.length < 3)) {

            var promise = null;

            // Enable writeuser for accessing FreeQ
            h.enable_writeuser();
            if(kind === "merge") {
                promise = freeq.merge_topics(null, winningItem, losingItem, true);
            } else if(kind === "delete") {
                promise = freeq.delete_topic(null, losingItem, true);
            } else {
                return {
                  error: "Auto merge/delete failed, please try again."
                };
            }
            promise.then(function(result){
              return {
                info: "This object has been deleted/merged."
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
