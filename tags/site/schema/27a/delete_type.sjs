/*
 * Copyright 2010, Google Inc.
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

var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

/**
 * Delete a type. If the type is being "used", throws an exception unless force=true.
 * You can also pass dry_run=true to see what will be deleted.
 *
 * A type is "used" if one or more of the following is true:
 *   1. it has an instance count > 0, according to the activity bdb,
 *   2. it is expected by any property
 *
 * delete type by
 *   1. remove /type/type
 *   2. remove domain link
 *   3. remove keys from domain
 *   4. remove property expected type on properties you have permission on
 *   5. take note of the properties that you don't have permission on
 *
 * @param type_id:String (required) - type id
 * @param user_id:String (required) - user id permitted to delete this type
 * @param dry_run:Boolean (optional) - don't write, just return what will be deleted.
 *                                     dry_run takes precedence over force.
 * @param force:Boolean (optional) - delete type even if type is being "used"
 * @throws type_info:Object if force != true and type being "used"
 * @return a tuple [type_info, result] where type_info is what was deleted
 * and result is the mqlwrite result of deleting the type.
 */
function delete_type(type_id, user_id, dry_run, force) {
  return type_info(type_id, user_id)
    .then(function(info) {
      if (dry_run) {
        return [info, null];
      }
      if (!force && (info.instance_count ||
          info.expected_by.permitted.length ||
          info.expected_by.not_permitted.length)) {
        throw deferred.rejected(JSON.stringify(info));
      }
      var q = {
        guid: info.guid,
        type: {id: "/type/type", connect: "delete"},
        "/type/type/domain": {id: info.domain.id, connect: "delete"},
        "/dataworld/gardening_task/async_delete": {value:true, connect:"update"}
      };
      if (info.key.length) {
        q.key = [{namespace:k.namespace, value:k.value, connect: "delete"} for each (k in info.key)];
      }
      if (info.expected_by.permitted.length) {
        q["/type/type/expected_by"] = [{id: eb.id, connect: "delete"} for each (eb in info.expected_by.permitted)];
      }
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          // cleanup result
          result.domain = result["/type/type/domain"];
          result.expected_by = result["/type/type/expected_by"];
          return [info, result];
        });
    });
};

/**
 * Undo delete_type.
 *
 * @param type_info:Object (required) - the type info returned by delete_type
 */
function undo(type_info) {
  var q = {
    guid: type_info.guid,
    type: {id: "/type/type", connect: "insert"},
    "/type/type/domain": {id: type_info.domain.id, connect: "insert"},
    "/dataworld/gardening_task/async_delete": {value:true, connect:"delete"}
  };
  if (type_info.key.length) {
    q.key = [{namespace:k.namespace, value:k.value, connect: "insert"} for each (k in type_info.key)];
  }
  if (type_info.expected_by.permitted.length) {
    q["/type/type/expected_by"] = [{id: eb.id, connect: "insert"} for each (eb in type_info.expected_by.permitted)];
  }
  return freebase.mqlwrite(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      // cleanup result
      result.domain = result["/type/type/domain"];
      result.expected_by = result["/type/type/expected_by"];
      return [type_info, result];
    });
};

function type_info(type_id, user_id) {
  var promises = [];
  // get type instance counts
  var activity_id = type_id;
  promises.push(freebase.get_static("activity", activity_id)
    .then(function(activity) {
      return activity || {};
    })
    .then(function(activity) {
      if (activity.total) {
        return activity.total["new"] || 0;
      }
      return 0;
    }));
  // type info (domain, key, expected_by)
  promises.push(type_info_query(type_id, user_id));
  return deferred.all(promises)
    .then(function([count, info]) {
      info.instance_count = count;
      return info;
    });
};

function type_info_query(type_id, user_id) {
  var q = {
    id: type_id,
    guid: null,
    name: null,
    type: "/type/type",
    domain: {id: null, name: null},
    key: [{
      optional: true,
      namespace: {
        id: null,
        permission: [{permits: [{member: {id: user_id}}]}]
      },
      value: null
    }],
    // Get the properties that expect this type that you have permission on.
    // These links can be removed.
    expected_by: [{
      id: null,
      optional: true,
      permission: [{permits: [{member: {id: user_id}}]}]
    }],
    // opp: other people's properties
    // These cannot be removed
    "opp:expected_by": [{
      id: null,
      optional: true,
      permission:[{"permits": [{optional:"forbidden", member:{id: user_id}}]}]
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      return {
        id: result.id,
        guid: result.guid,
        name: result.name,
        domain: result.domain,
        key: [{namespace:k.namespace.id, value:k.value} for each (k in result.key)],
        expected_by: {
          permitted: [{id:p.id} for each (p in result.expected_by)],
          not_permitted: [{id:p.id} for each (p in result["opp:expected_by"])]
        }
      };
    });
};
