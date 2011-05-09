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

var h = acre.require("lib/helper/helpers.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis");
var freebase = apis.freebase;
var urlfetch = apis.urlfetch;
var deferred = apis.deferred;

function types_mql(id) {
  return {
    "id": id,
    "guid": null,
    "type": "/type/domain",
    "types": [{
      "id": null,
      "guid": null,
      "name": null,
      "timestamp": null,
      "creator": {
        "id": null,
        "name": null
      }
    }],
    "/freebase/domain_profile/featured_views": [{
      "id": null,
      "guid": null,
      "name": null,
      "creator": {
        "id": null,
        "name": null
      },
      "timestamp": null,
      "/common/document/content": {
        "id": null,
        "optional": "required"
      }
    }]
  };
};

/**
 * Domain query and for each type in the domain:
 * 1. get type instance counts
 */
function domain(id) {
  var q = types_mql(id);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || [];
    })
    .then(function(domain) {
      
      // initialize promise array
      var promises = [];

      // contruct path for BDB file
      var activity_id = "summary_/guid/" + domain.guid.slice(1);

      // get BDB summary for domain
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })

        // with domain activity, iterate through types
        // and get instance count
        // and reattach to domain object
        .then(function(activity) {
          if (activity.types) {
            domain.types.forEach(function(type) {
              type.instance_count = activity.types[type.id] || 0;
            });
          }
          return activity;
      }));

      return deferred.all(promises)
        .then(function() {
          return domain;
        });
    });
};
