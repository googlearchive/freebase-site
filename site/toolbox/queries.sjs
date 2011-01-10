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
 * Get all domains user_id is an admin of AND member of (/freebase/user_profile/favorite_domains)
 */
function domain_membership(user_id) {
  var q_admin = acre.freebase.extend_query(mf.require("admin_domains").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(mf.require("fav_domains").query, {id: user_id});

  function callback([r_admin, r_fav]) {
    var r_admin = r_admin.result;
    var r_fav = r_fav.result;

    var map = {};

    if (r_admin) {
      r_admin["!/type/usergroup/member"].forEach(function(m) {
        m["!/type/domain/owners"].forEach(function(d) {
          map[d.id] = {id:d.id, name:d.name, admin:true};
        });
      });
    }
    if (r_fav) {
      r_fav["/freebase/user_profile/favorite_domains"].forEach(function(d) {
        if (! (d.id in map)) {
          map[d.id] = {id:d.id, name:d.name};
        }
      });
    }
    var domains = [];
    for (var k in map) {
      domains.push(map[k]);
    }
    domains.sort(function(a,b) {
      return a.name > b.name;
    });
    return domains;
  };

  var d_admin = freebase.mqlread(q_admin);
  var d_fav = freebase.mqlread(q_fav);

  return deferred.all([d_admin, d_fav]).then(callback);
};

/**
 * Get all types user_id is an admin of AND member of (/freebase/user_profile/favorite_types)
 */
function type_membership(user_id) {
  var q_admin = acre.freebase.extend_query(mf.require("admin_types").query, {id: user_id});
  var q_fav = acre.freebase.extend_query(mf.require("fav_types").query, {id: user_id});

  function callback([r_admin, r_fav]) {
    var r_admin = r_admin.result;
    var r_fav = r_fav.result;

    var map = {};

    if (r_admin) {
      r_admin["!/type/usergroup/member"].forEach(function(m) {
        m["!/type/domain/owners"].forEach(function(d) {
          d["types"].forEach(function(t) {
            map[t.id] = {id:t.id, name:t.name, admin:true};
          });
        });
      });
    }
    if (r_fav) {
      r_fav["/freebase/user_profile/favorite_types"].forEach(function(t) {
        if (! (t.id in map)) {
          map[t.id] = {id:t.id, name:t.name};
        }
      });
    }
    var types = [];
    for (var k in map) {
      types.push(map[k]);
    }
    types.sort(function(a,b) {
      return a.name > b.name;
    });
    return types;
  };

  var d_admin = freebase.mqlread(q_admin);
  var d_fav = freebase.mqlread(q_fav);

  return deferred.all([d_admin, d_fav]).then(callback);
};


function user_queries(user_id) {
  var q = acre.freebase.extend_query(mf.require("user_queries").query, {creator:user_id});
  return freebase.mqlread(q)
    .then(function(result) {
      return result.result;
    });
};
