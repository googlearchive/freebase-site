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
      "name": i18n.mql.query.name(),
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



/**
 * Type query
 * Get a type and a subset of instances
 */
function type(type_id) {

  var PROP_COUNT = 3;

  // define our current language
  var lang = i18n.lang;

  // get our type plus basic set of properties
  var q = {
    "id": type_id,
    "guid": null,
    "type": "/type/type",
    "/freebase/type_hints/mediator": null,
    "properties": [
      propbox_mql.prop_schema({
        "/freebase/property_hints/disambiguator": null,
        "index": null,
        "optional": true
        }, lang)
     ]
  };

  return freebase.mqlread(q)
  .then(function(env) {

    // placeholder for all our promise requests
    var promises = {};

    /**
     *  Call Activity service to get Type metadata,
     *  including instance count, etc.
    */ 

    // contruct path for BDB file
    var activity_id = "/guid/" + env.result.guid.slice(1);

    // get BDB summary for type
    promises.activity = freebase.get_static("activity", activity_id)
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
    });

    // simple flag for use in template
    var is_mediator = env.result['/freebase/type_hints/mediator'] === true;

    // Generate list properties we want to query for and output
    var properties = env.result.properties;
    var prop_structures = [];

    // iterate through type properties and
    // attach any disambiguating properties that are non-mediating
    properties.forEach(function(prop) {
      if(prop["/freebase/property_hints/disambiguator"]) {
        if(prop["expected_type"]["/freebase/type_hints/mediator"] !== true) {
          console.log("attach disambiguating property");
          prop_structures.push(ph.minimal_prop_structure(prop, lang));
        }
      }
    });

    // If insufficient non-mediating disambiguating properties were found
    // attach more properties for display 
    if(prop_structures.length < PROP_COUNT) {
      properties.forEach(function(prop) {
        if(prop["/freebase/property_hints/disambiguator"] !== true && prop["expected_type"]["/freebase/type_hints/mediator"] !== true) {
          prop_structures.push(ph.minimal_prop_structure(prop, lang));
        }
      });
    }

    // Make prop_structures equal PROP_COUNT if the type not a mediator
    // We don't want to to display too many columns
    if(prop_structures.length > PROP_COUNT && !is_mediator) {
      prop_structures = prop_structures.slice(0,PROP_COUNT);
    }

    /**
     * Now that we have properties to display
     * we need to construct an instance query,
    */ 

    // our basic query shape
    var q = [{
      id: null,
      mid: null,
      limit: 60,
      name: i18n.mql.query.name(),
      type: type_id,
      optional: true
    }];

    // push each of the properties onto
    // our instance query
    prop_structures.forEach(function(prop_structure) {
      q[0][prop_structure.id] = ph.mqlread_query(null,
        prop_structure, null, lang)[prop_structure.id];
    });

    // execute instance query
    promises.data = freebase.mqlread(q);

    // wait for all queries to finish
    // and return to controller
    return deferred.all(promises)
      .then(function(results) {
        return {
          instances: results.data.result,
          activity: results.activity,
          properties: prop_structures,
          is_mediator: is_mediator,
          table_type: "type"
        };
    });
  })
};



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
            result: env.result
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
