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
var h = acre.require("helper/helpers.sjs");
var freebase = acre.require("promise/apis").freebase;

/**
 * Return a promise to check whether or not user_id 
 * is a member of a permission group for a topic or
 * a list of topics.
 * 
 * {
 *   id: topic_id,
 *   permission: [{
 *     member: [{
 *       id: user_id
 *     }]
 *   }]
 * }
 */
function has_permission(id_or_ids, user_id) {
  var id = id_or_ids;
  if (!h.isArray(id)) {
    id = [id];
  }
  var q = [{
    id: null,
    "id|=": id,
    permission: {
      optional: true,
      id: null,
      type: "/type/permission",
      permits: [{
        member: [{
          id: user_id
        }]
      }]
    }
  }];
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || [];
    })
    .then(function(result) {
      var permissions = {};
      result.forEach(function(o) {
        permissions[o.id] = o.permission !== null;
      });
      return permissions;
    });
};
