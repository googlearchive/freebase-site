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

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var pq = acre.require("propbox/queries.sjs");
var ph = acre.require("propbox/helpers.sjs");
var typeloader = acre.require("schema/typeloader.sjs");

/**
 * Get topic data/structure from Topic API
 *
 * @deprecated This is using the OLD topic api. Please use topic_structure
 */
function topic(id, lang, limit, as_of_time, domains) {
  var params = {
    lang: [lang || "/lang/en"]
  };
  if (params.lang != "/lang/en") {
    params.lang.push("/lang/en");
  }
  //params.lang.push("/lang/wp");
  if (limit) {
    params.limit = limit;
  }
  if (as_of_time) {
    params.as_of_time = as_of_time;
  }
  if (domains) {
    params.domains = domains;
  }
  var url = h.fb_api_url("/api/experimental/topic/full", id, params);
  return freebase.fetch(url)
    .then(function(env) {
      return env.result;
    });
};



/**
 * Use the new topic api (googleapis) and lib/typeloader.sjs to retrieve
 * topic and schema information that can be used to display a topic page.
 *
 * @param id:String - The topic id
 * @param lang:String - The primary language for all text values in the result.
 *   By default, "en" is the default language.
 * TODO: @see url to topic api
 */
function topic_structure(id, lang) {
  var options = {alldata:true};
  options.lang = h.lang_code(lang || "/lang/en");
  return freebase.get_topic(id, options)
    .then(function(topic_result) {
      var types = null; // list of types this topic is an instance of
      var notable_types = null; // list of types sorted by their notability
      var property = topic_result && topic_result.property;
      if (property) {
        types = property["/type/object/type"];
        types = types && types.values;
        notable_types = property["/common/topic/notable_types"];
        notable_types = notable_types && notable_types.values;
      }
      var d;
      if (types && types.length) {
        var type_ids = types.map(function(t) { return t.id; });
        // typeloader.load takes var args: [true, type_id1, type_id2, ..., type_idN]
        d = typeloader.load.apply(null, [true].concat(type_ids))
          .then(function(typeloader_result) {
             return {
               topic: topic_result,
               structure: get_structure(typeloader_result, notable_types, lang)
             };
          });
      }
      else {
        d = deferred.resolved({
          topic: topic_result,
          structure: to_structure([], lang) // empty structure
        });
      }
      return d;
    });
};

/**
 * Group a dictionary of types (key'ed by type id) into their respective domains.
 *
 * @param types:Object - a dictionary of types returned by typeloader.load().
 * @return a dictionary of domains key'ed by domain ids where each domain has {id:"...", name:[...], types:[...]}
 */
function group_by_domains(types) {
  var domains = {};
  for (var type_id in types) {
    var type = types[type_id];
    var domain_id = type.domain.id;
    var domain = domains[domain_id];
    if (!domain) {
      domain = domains[domain_id] = h.extend(true, {types:[]}, type.domain);
    }
    domain.types.push(type);
  }
  return domains;
};

/**
 * Sort domains and their types by the notable_types sort order.
 * First, types within domains are sorted by the notable_types sort order.
 * Then, the domains are sorted by comparing the first type in the notable_types sort order.
 * If notable_types is empty, the sorting of domains and their types is undefined.
 *
 * @param types:Object - a dictionary of types returned by typeloader.load()
 * @param notable_types:Array - a list of types sorted by their notablility.
 * @return a list of domains and their types sorted by the notable_types sort order.
 */
function get_structure(types, notable_types, lang) {
  var domains = group_by_domains(types);
  var domains_list = [];
  for (var domain_id in domains) {
    domains_list.push(domains[domain_id]);
  }
  if (notable_types && notable_types.length) {
    // notable_types are currently returned in reverse order.
    notable_types.reverse();
    var notable_types_index = {};
    notable_types.forEach(function(t, i) {
      notable_types_index[t.id] = i;
    });
    function compare_notable_types_index(a, b) {
      var a_index = notable_types_index[a.id];
      var b_index = notable_types_index[b.id];
      if (!(a_index == null || b_index == null)) {
        return a_index - b_index;
      }
      else if (a_index == null && b_index === null) {
        return 0;
      }
      else if (a_index == null) {
        return 1;
      }
      else if (b_index == null) {
        return -1;
      }
    };
    // sort all the types within each domain by notable_types index
    domains_list.forEach(function(domain) {
      domain.types.sort(compare_notable_types_index);
    });
    // now sort the domains using the notable_types index of the first type
    domains_list.sort(function(a, b) {
      var a_type = a.types.length ? a.types[0] : null;
      var b_type = b.types.length ? b.types[0] : null;
      if (a_type && b_type) {
        return compare_notable_types_index(a_type, b_type);
      }
      else if (a_type) {
        return -1;
      }
      else if (b_type) {
        return 1;
      }
      return 0;
    });
  }
  else {
    // without notable_types, the domains_list sort order is undefined
  }
  return to_structure(domains_list, lang);
};

/**
 * Transform a domains list to a usable structure.
 * Note that the result will be compatible to the old topic api:
 * http://api.freebase.com/api/experimental/topic/full?id=/en/google
 *
 * @param domains_list:Array - A sorted list of domains and their respective types
 * @return A structure outlining the order of domains, the order of their respective types and
 *  the order of the domains's types' disambiguating properties.
 */
function to_structure(domains_list, lang) {
  var structure = {
    order: [],
    domains: {},
    types: {},
    properties: {}
  };
  domains_list.forEach(function(domain) {
    structure.order.push(domain.id);
    var domain_name = i18n.mql.get_text(lang, domain.name);
    var domain_structure = structure.domains[domain.id] = {
      text: domain_name.value,
      lang: domain_name.lang,
      types: []
    };
    domain.types.forEach(function(type) {
      domain_structure.types.push(type.id);
      var type_name = i18n.mql.get_text(lang, type.name);
      var type_structure = structure.types[type.id] = {
        text: type_name.value,
        lang: type_name.lang,
        properties: []
      };
      type.properties.forEach(function(prop) {
        type_structure.properties.push(prop.id);
        var prop_name = i18n.mql.get_text(lang, prop.name);
        var prop_structure = structure.properties[prop.id] = ph.to_prop_structure(prop, lang);
      });
    });
  });
  return structure;
};
