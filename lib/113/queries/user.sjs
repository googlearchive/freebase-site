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
var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var urlfetch = apis.urlfetch;
var deferred = apis.deferred;

// Return list of domains owned by user
function owned_domains(user_id) {

  // forbid:type clause is to get rid of apps
  // key clause is to get rid of improperly deleted apps/domains
  var q = [{
    "id":   null,
    "name": i18n.mql.query.name(),
    "type": "/type/domain",
    "forbid:type": {
      "id": "/freebase/apps/application",
      "optional": "forbidden"
    },
    "key" : {
      "value": null,
      "limit": 0
    },
    "/type/domain/owners": {
      "member": {
        "optional": false,
        "id": user_id,
        "link": {
          "timestamp": null
        }
      },
    },
    "limit": 1000
  }];

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result.sort(sort_by_name);
    });
};

// Return list of domains watched by user
function watched_domains(user_id) {
  // query to get domains which the
  // user is only watching
  var q = [{
    "id": null,
    "name": i18n.mql.query.name(),
    "type": "/type/domain",
    "!/freebase/user_profile/favorite_domains": {
      "id": user_id,
      "link": {
        "timestamp": null
      },
      "limit": 1
    },
    "limit": 1000
  }];

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result.sort(sort_by_name);
    });
};

function sort_by_id(a, b) {
  return b.id < a.id;
};

function sort_by_name(a, b, lang) {
  var a_name = i18n.mql.get_text(lang, a.name);
  a_name = a_name && a_name.value || a.id;
  var b_name = i18n.mql.get_text(lang, b.name);
  b_name = b_name && b_name.value || b.id;
  return b_name < a_name;
};


