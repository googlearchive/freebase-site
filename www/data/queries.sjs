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
      var activity_id = "/guid/" + domain.guid.slice(1);

      // get BDB summary for domain
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })

        // With domain activity, do the following:
        // 1. Add metadata activity to domain object
        //    - total facts
        //    - total facts last week
        //    - total topics
        //    - topics w/ images
        //    - topics w/ articles
        //    - weekly activity summary
        // 2. Iterate through types and attach instance count
        // 3. Add Top Contributors to domain object

        .then(function(activity) {

          // facts
          domain.total_facts = activity.total.edits || 0;
          domain.facts_last_week = activity.week.total_edits || 0;

          //topics
          domain.total_topics = activity.total['new'] || 0;
          domain.topics_with_images = Math.round((activity.has_image / domain.total_topics) * 100);
          domain.topics_with_articles = Math.round((activity.has_article / domain.total_topics) * 100);

          // daily summary for graph output
          // we only want the last 10 or so values
          domain.activity_summary = activity.edits;
          if (domain.activity_summary.length > 10) {
            domain.activity_summary = domain.activity_summary.slice(-11, -1);
          }

          // Attach top 5 contributors to domain object
          // For now, we do a simple string filter to
          // weed out bots. However, this should be 
          // added to the activity service

          var users = [];
          activity.week.users.forEach(function(user) {
            if (user.id.indexOf("_bot") === -1) {
              user.display_name = user.id.split("/")[2];
              user.percentage = Math.round(user.v / domain.facts_last_week * 100);
              users.push(user);
            }
          });

          domain.top_contributors = users;

          return activity;
      }));

      // Attach instance_count to domain.type[i]
      // We have to make a separate BDB call because the "full"
      // file does not include instance counts for mediators.
      // this should be fixed in BDB updates.

      var summary_id = "summary_/guid/" + domain.guid.slice(1);
      promises.push(freebase.get_static("activity", summary_id) 
        .then(function(summary) {
          return summary || {};
        })

        .then(function(summary) {

          if (summary.types) {
            domain.types.forEach(function(type) {
              type.instance_count = summary.types[type.id] || '-';
            });
          }

          return summary;
        }));

      return deferred.all(promises)
        .then(function() {
          return domain;
        });
    });
};
