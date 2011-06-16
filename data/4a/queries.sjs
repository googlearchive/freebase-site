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
var propbox_mql = acre.require("lib/propbox/mql.sjs");
var propbox_queries = acre.require("lib/propbox/queries.sjs");
var ph = acre.require("lib/propbox/helpers.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var freebase = apis.freebase;
var freebase_query = acre.require("lib/queries/freebase_query.sjs");
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
      "name": i18n.mql.query.name(),
      "timestamp": null,
      "creator": null,
      "optional": true
    }]
  };
};

/**
 * Domain query and for each type in the domain:
 */
function domain(id) {

  // get initial domain query
  // including related types
  var q = types_mql(id);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || [];
    })
    .then(function(domain) {

      // we don't want to return /base/id/topic
      var base_common_topic_id = domain.id + "/topic";

      var domain_types = [];
      for(i=0; i<domain.types.length; i++) {

        if(domain.types[i].id !== base_common_topic_id) {
         domain_types.push(domain.types[i]);
        }
      }
      domain.types = domain_types;

      // initialize promise array
      var promises = [];

      // contruct path for BDB file
      var activity_id = "/guid/" + domain.guid.slice(1);

      // get BDB summary for domain
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {
            edits: [],
            total: {},
            week: {}
          };
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
          domain.topics_with_images = activity.has_image ? Math.round((activity.has_image / domain.total_topics) * 100) : 0;
          domain.topics_with_articles = activity.has_image ? Math.round((activity.has_article / domain.total_topics) * 100) : 0;

          // daily summary for graph output
          // we only want the last 10 or so values
          domain.activity_summary = activity.edits;
          if (domain.activity_summary.length > 10) {
            domain.activity_summary = domain.activity_summary.slice(-11, -1);
          }

          // Attach top contributors to domain object
          // For now, we do a simple string filter to
          // weed out bots. However, this should be
          // added to the activity service

          var users = [];
          activity.week.users.forEach(function(user) {
            if (user.id.indexOf("_bot") === -1) {
              user.display_name = user.id.split("/").pop();
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
              type.instance_count = summary.types[type.id] || null;
            });
          }

          return summary;
        }));

      // TODO: this query is removed for now. Refactor with projects
      // attach domain saved views to domain object

      //promises.push(freebase_query.featured_views_by_domain(domain.id)
      //    .then(function(views) {
      //      domain.featured_views = views;
      //  }));

      return deferred.all(promises)
        .then(function() {
          return domain;
        });
    });
};

/**
 * Type query
 * Get a type and a subset of instances
 */
function type(type_id) {
  // define our current language
  var lang = i18n.lang;

  // get the properties and domain associated with our type
  var q = {
    id: type_id,
    guid: null,
    type: "/type/type",
    domain: {
      id: null,
      name: i18n.mql.query.name()
    },
    "/freebase/type_hints/mediator": null,
    properties: [
      propbox_mql.prop_schema({
        "/freebase/property_hints/disambiguator": null,
        optional: true,
        index: null,
        sort: "index"
      }, lang)
    ]
  };

  return freebase.mqlread(q)
    .then(function(env) {
      var this_type = env.result;

      var promises = [];
      /**
       *  Call Activity service to get Type metadata,
       *  including instance count, etc.
      */
      // contruct path for BDB file
      var activity_id = "/guid/" + this_type.guid.slice(1);
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          if (!activity) {
            return {};
          }
          var summary = {};
          summary.topic_count = activity.total['new'];
          summary.facts = activity.total.edits;
          summary.has_article = activity.has_article;
          summary.has_image = activity.has_image;
          return summary;
        }));

      // build two separate arrays
      // one holds disambiguating properties
      // the other olds non-disambiguating properties
      var disambiguators = [];
      var properties = [];
      this_type.properties.forEach(function(prop) {
        if (prop["/freebase/property_hints/disambiguator"]) {
          disambiguators.push(prop);
        }
        else {
          properties.push(prop);
        }
      });

      // join the two arrays together, keeping disambiguators first
      properties = disambiguators.concat(properties);

      // We need to check whether we have any mediated properties.
      // If so, we want to limit the number of properties returned
      // to just 1 so as not to overwhelm the page layout.
      // Otherwise, return up to 3 properties.

      var mediated_properties = false;
      var PROP_COUNT = 3;

      if (properties.length < PROP_COUNT) {
        prop_length = properties.length
      }
      else {
        prop_length = PROP_COUNT;
      }

      for (i=0; i < prop_length; i++) {
        if(properties[i]['expected_type']['/freebase/type_hints/mediator']) {
          mediated_properties = true;
          break;
        }
      }

      if(mediated_properties === true) {
        properties = properties.slice(0,1);
      }
      else {
        properties = properties.slice(0,3);
      }

      var prop_structures = properties.map(function(prop) {
        return ph.minimal_prop_structure(prop, lang);
      });

      /**
       * Now that we have properties to display
       * we need to construct an instance query,
      */

      // our basic query shape
      var q = [{
        id: null,
        mid: null,
        limit: 30,
        name: i18n.mql.query.name(),
        "/common/topic/article": i18n.mql.query.article(),
        type: type_id,
        optional: true
      }];

      // push each of the properties onto
      // our instance query
      prop_structures.forEach(function(prop_structure) {
        var prop_clause = ph.mqlread_query(null, prop_structure, null, lang)[prop_structure.id];
        prop_clause[0].limit = 5;
        q[0][prop_structure.id] = prop_clause;
      });

      // execute instance query
      promises.push(freebase.mqlread(q)
        .then(function(env) {
          var blurbs = [];
          env.result.forEach(function(topic) {
            blurbs.push(i18n.get_blurb(topic, {maxlength:300}));
          });
          return deferred.all(blurbs)
            .then(function() {
              return env.result || [];
            });
        }));

      return deferred.all(promises)
        .then(function([activity, instances]) {
          console.log(instances);
          return {
            activity: activity,
            instances: instances,
            properties: prop_structures,
            root_type_is_mediator: this_type["/freebase/type_hints/mediator"] === true,
            domain: this_type.domain
          };
        });
    });
};

/**
 * Saved query
 */
function saved_query(id) {
  return freebase.get_blob(id)
    .then(function(env) {
      return JSON.parse(env.body);
    }).
    then(function(q){
      return freebase.mqlread(q)
        .then(function(env) {
          return {
            query: q,
            result: env.result,
            table_type: "query"
          };
      });
  });
};


function property_detail(topic, property) {
  return freebase.mqlread([{
    "type": "/type/property",
    "master_property" : null,
    "reverse_property" : null,
    "schema": {
      "id" : null,
      "/freebase/type_hints/mediator": null,
      "!/type/property/expected_type": {
        "id": property
      }
    },
    "key": {
      "value": null,
      "namespace": {
        "!/type/property/expected_type": {
          "id": property
        }
      }
    },
    "unique" : null,
    "/freebase/property_hints/disambiguator": true,
  }])
  .then(function(env) {
    return env.result;
  })
  .then(function(result){
    if (!result.length) redirect();
    var type = result[0].schema;
    var q = {
      "type": type.id
    };
    q["!" + property] = { "id": topic };
    if (!type["/freebase/type_hints/mediator"]) {
      q.name = null;
      q.mid = null;
    }
    result.forEach(function(prop) {
      if (!(prop.master_property === property || prop.reverse_property === property)) {
        q[prop.key.value] = prop.unique ? null : [];
      }
    });
    return [q];
  })
  .then(function(q) {
    return freebase.mqlread(q)
      .then(function(env) {
        return {
          query: q,
          result: env.result
        };
      });
  });
};

// Return list of domains by user
function user_domains(user) {

  // query to get domains in which user
  // is an Owner
  // forbid:type clause is to get rid of apps
  // key clause is to get rid of improperly deleted apps/domains
  var q1 = [{
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
        "id": user,
        "link": {
          "timestamp": null
        }
      },
    },
    "limit": 1000
  }];

  // query to get domains which the
  // user is only watching
  var q2 = {
    "id": user,
    "type": "/type/user",
    "/freebase/user_profile/favorite_domains": [{
      "id": null,
      "name": i18n.mql.query.name(),
      "link": {
        "timestamp": null
      },
      "limit": 1000
    }]
  };

  var promises = {};

  promises.domains_owned = freebase.mqlread(q1);
  promises.domains_watched = freebase.mqlread(q2);

  return deferred.all(promises)
    .then(function(results) {
      return {
        owned: results.domains_owned.result,
        watched: results.domains_watched.result
      };
  });
};
