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
var propbox_queries = acre.require("lib/propbox/queries.sjs");
var ph = acre.require("lib/propbox/helpers.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var schema = acre.require("lib/schema/typeloader.sjs");
var collection = acre.require("lib/collection/queries.sjs");
var freebase = apis.freebase;
var urlfetch = apis.urlfetch;
var deferred = apis.deferred;
var validators = acre.require("lib/validator/validators.sjs");
var stats = acre.require("lib/queries/stats.sjs");

function types_mql(id) {
  return {
    "id": id,
    "type": "/type/domain",
    "types": [{
      "id": null,
      "name": i18n.mql.query.name(),
      "timestamp": null,
      "creator": null,
      "optional": true
    }]
  };
}

/**
 * Domain query and for each type in the domain:
 */
function domain(id) {

  var q = types_mql(id);

  var promises = {};

    // Get domain and filter out /base/id/topic
  promises.domain = freebase.mqlread(q)
    .then(function(env) {
      return env.result || [];
      })
    .then(function(domain) {
      var base_common_topic_id = domain.id + "/topic";
      domain.types = domain.types.filter(function(type){
        return type !== base_common_topic_id;
      });
      return domain;
    });

  // Get stats for specified domain
  promises.stats = stats.get_domain_stats(id);


  // With domain and stats, do the following:
  // 1. Add metadata to domain object
  //    - total facts
  //    - total facts last week
  //    - total topics
  //    - topics w/ images
  //    - topics w/ articles
  //    - weekly activity summary
  // 2. Iterate through types and attach instance count
  // 3. Add Top Contributors to domain object
  // If stats fetch failed, just return domain with defaults
  return deferred.all(promises).then(function(result){
    var domain = result.domain;
    var domain_stats = result.stats || {};

    // facts
    domain.total_facts = domain_stats.triples || 0;

    //topics
    domain.total_topics = domain_stats.entities || 0;

    // Stats API won't return has_image, has_article
    // TODO: Uncomment if it does.
    //if (domain_stats.has_image && domain_stats.has_article) {
    //  domain.topics_with_images = domain_stats.has_image / domain.total_topics;
    //  domain.topics_with_articles = domain_stats.has_article / domain.total_topics;
    //} else {
    //  domain.topics_with_images = 0;
    //  domain.topics_with_articles = 0;
    //}

    // daily summary for graph output
    // we only want the last 10 or so values
    domain.activity_summary = [];
    for (var date in domain_stats.triples_by_day) {
      domain.activity_summary.push({
        id: date,
        v: domain_stats.triples_by_day[date]
      });
    }

    domain.activity_summary.sort(function(a,b){
      return a.id < b.id;
    });
    if (domain.activity_summary.length > 10) {
      domain.activity_summary = domain.activity_summary.slice(0, 9);
    }
    // Get facts from last week
    if (domain_stats.triples_7days) {
      domain.facts_last_week = domain_stats.triples_7days;
    } else {
      domain.facts_last_week = 0;
      domain.activity_summary.slice(0,6).forEach(function(fact){
        domain.facts_last_week += fact.v;
      });
    }

    // Attach top contributors to domain object
    // For now, we do a simple string filter to
    // weed out bots. However, this should be
    // added to the activity service
    var users = [];

    // Stats API won't return user info
    // TODO: Uncomment if it does.
    //activity.week.users.forEach(function(user) {
    //  if (valid_activity_user(user)) {
    //    if (user.id.indexOf("_bot") === -1) {
    //      user.display_name = user.id.split("/").pop();
    //      user.percentage = (user.v / domain.facts_last_week);
    //      users.push(user);
    //    }
    //  }
    //});
    domain.top_contributors = users;

    // types
    domain.types.forEach(function(type) {
      if (domain_stats.nodes_by_type) {
        type.instance_count = domain_stats.nodes_by_type[type.id] || null;
      }
    });

    return domain;
  });
}

/**
 * Activity is returning invalid users where user.id == "null"
 * (a string "null")???
 */
function valid_activity_user(user) {
  if (user) {
    return validators.MqlId(user.id, {
      if_valid:true, if_invalid:false, if_empty:false
    });
  }
  return false;
}

/**
 * Return domains from memcache, if not present load them with mqlread
 */
function load_commons_domains() {
  var lang = i18n.lang_code;
  var domains = acre.cache.request.get('domains:'+lang);
  if(!domains) {
    var q = [{
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/domain",
      "/freebase/domain_profile/category": {
        id: "/category/commons"
      }
    }];
    return freebase.mqlread(q).then(function(env){
      domains = env.result;
      acre.cache.request.put("domains:"+lang, domains);
      return domains;
    });
  }
  return domains;
}

/**
 * Type query
 * Get a type and a subset of instances
 */
function type(type_id, query) {

  var promises = {};

  // Get Stats for given type
  promises.activity = stats.get_type_stats(type_id)
    .then(function(result) {
      if (result) {
        var summary = {};
        summary.topic_count = result.triples;
        summary.facts = result.nodes;
        summary.has_article = result.has_article || 0;
        summary.has_image = result.has_image || 0;
        return summary;
      } else {
        return {};
      }
    }, function(err) {
      return {};
    });


  // Load Type
  promises.load_result = schema.load(type_id)
    .then(function(r) {
      var this_type = r;

      // our basic collection query shape
      var q = {
        id: null,
        mid: null,
        limit: 30,
        name: i18n.mql.query.name(),
        type: type_id,
        "/common/topic/article": {
          id: null,
          limit: 1,
          optional: true
        },
        optional: true
      };

      if (query) {
        if (h.isArray(query)) {
          query = query[0];
        }
        q = h.extend(q, query);
      } else {
        extend_type_query(q, this_type);
      }

      return {
        collection: collection.query([q]),
        this_type: this_type
      };
    });


  return deferred.all(promises)
    .then(function(result) {
      return {
        activity: result.activity,
        table: result.load_result.collection,
        root_type_is_mediator:
          result.load_result.this_type["/freebase/type_hints/mediator"] === true,
        domain: result.load_result.this_type.domain,
        query: query
      };
    });
}

function extend_type_query(q, type) {
  // define our current language
  var lang = i18n.lang;

  // build two separate arrays
  // one holds disambiguating properties
  // the other olds non-disambiguating properties
  var disambiguators = [];
  var properties = [];
  type.properties.forEach(function(prop) {
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
    prop_length = properties.length;
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

  // push each of the properties onto
  // our instance query
  properties.forEach(function(prop_structure) {
    var prop_clause = ph.mqlread_query(null, prop_structure, null, lang)[prop_structure.id];
    prop_clause[0].limit = 5;
    q[prop_structure.id] = prop_clause;
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
    "/freebase/property_hints/disambiguator": true
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
