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

var h = acre.require("lib/helper/helpers.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;

/**
* Gets the permitted users (grouped by usergroup) 
* for any permissioned object.  Works for usergroups
* themselves too (always returns list of one usergroup)
*
* @param id:String - permissioned object id
* @param type:String - the type of object... primarily used to return
*                      other objects of the same type for each user
* @return A promise that returns an array of usergroups
**/
function object_usergroups(id, type) {
  return freebase.mqlread(group_query(id, type))
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    var groups = [];
    result.forEach(function(g) {
      var group = h.extend({}, g);
      group.users = g.member.map(format_user);
      delete group.member;
      group.metadata = {
        id: group.id,
        type: type
      };
      groups.push(group);
    });
    return groups;
  });
};

/**
* Get the data for an individual user in the context of an object, 
* including other objects of the same type they edit.
*
* @param id:String - user id
* @param objectid:String - permissioned object id
* @param type:String - the type of the permissioned object... primarily used
*                      to return other objects of the same type for each user
* @return A promise that returns a user object
**/
function user(id, objectid, object_type) {
  return freebase.mqlread(user_query(id, objectid, object_type))
    .then(function(env) {
      return env.result;
    })
    .then(format_user);
};

function format_user(u) {
  var user = h.extend({}, u);
  var activity = user["!/freebase/user_activity/user"];
  user.assertions =  activity && activity["/freebase/user_activity/primitives_live"] || 0;
  user.groups = user["usergroup"].map(function(d) {
    return d["permitted"]["controls"];
  }).sort(by_name);
  user.metadata = {
    id: user.id
  };
  return user;
};

function group_query(id, type) {
  var q = [{
    "type": "/type/usergroup",
    "id": null,
    "name": i18n.mql.query.name(),
    "member": user_query(null, id, type)
  }];
  if (type == "/type/usergroup") {
    acre.freebase.extend_query(q, {
      "id": id
    });
  } else {
    acre.freebase.extend_query(q, {
      "permitted.controls.id": id,
      "key": {
        "namespace": "/boot",
        "optional": "forbidden"
      }
    });
  }
  return q;
};

function user_query(userid, objectid, object_type) {
  var q = {
    "id": null,
    "timestamp": null,
    "type": "/type/user",
    "!/freebase/user_activity/user": {
      "/freebase/user_activity/primitives_live": null,
      "optional": true
    },
    "usergroup": [{
      "permitted": {
        "controls": {
          "id": null,
          "name": i18n.mql.query.name(),
          "limit": 1
        },
        "limit": 1
      },
      "key": {
        "namespace": "/boot",
        "optional": "forbidden"
      },
      "limit": 3
    }]
  };
  if (objectid) {
    acre.freebase.extend_query(q, {
      "usergroup.permitted.controls.id!=": objectid
    });
  }
  if (object_type) {
    acre.freebase.extend_query(q, {
      "usergroup.permitted.controls.type": object_type
    });
  }
  if (userid) {
    q["m:id"] = userid;
  } else {
    q = [q];
  }
  return q;
};

function by_name(a, b) {
  return i18n.display_name(b).toLowerCase() < i18n.display_name(a).toLowerCase();
};
