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

var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;

function by_domain(domain) {
};

function by_user(user) {
};

function by_type(type) {
};


// Return a set of saved queries by domain
function featured_views_by_domain(domain) {
  var q = {
    "id": domain,
    "/freebase/domain_profile/featured_views": [{
      "/common/document/content": {
        "id": null,
        "limit": 0
      },
      "id": null,
      "optional": true,
      "name": i18n.mql.query.name(),
      "creator": null,
      "timestamp": null
    }]
  };

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result['/freebase/domain_profile/featured_views'];
    });
};

// Return a set of saved queries by user
function featured_views_by_user(user_id) {
  var q = [{
    "id": null,
    "name": i18n.mql.query.name(),
    "/freebase/domain_profile/featured_views": [{
      "id": null,
      "name": i18n.mql.query.name(),
      "creator": user_id,
      "/common/document/content": {
        "id": null,
        "limit": 0
      },
      "timestamp": null
    }]
  }];

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function apps_by_user(user) {
};
