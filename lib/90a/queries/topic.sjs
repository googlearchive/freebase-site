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
var deferred = apis.deferred;
var pq = acre.require("propbox/queries.sjs");
var ph = acre.require("propbox/helpers.sjs");
var typeloader = acre.require("schema/typeloader.sjs");
var proploader = acre.require("schema/proploader.sjs");
var validators = acre.require("validator/validators.sjs");

/**
 * Use the new topic api (googleapis) and lib/typeloader.sjs to retrieve
 * topic and schema information that can be used to display a topic page.
 *
 * @param object:Object (required) - The object returned by the object 
         router (becomes c.object)
 * @param options:Object (optional) - Api/filter options for topic api.
 *     - lang:String (optional) - The primary language to topic data. 
 *           Default is "en".
 *     - domain:String (optional) - If "all" retrieve all user/base domain data.
 *           You can also specify a domain id to only retrieve properties 
 *           within that domain. Default is to only retrieve data 
 *           from "Commons".
 *     - type:String (optional) - Only retrieve properties within this type id.
 *     - property:String (optional) - Only retrieve the property data for 
 *           this property id.
 * The domain, type and property exclusive options where you can only specify
 * one of them. If multiple options are specified then, the domain option takes
 * precedence, then then the type and then the property.
 * 
 * The topic structure will be a union of all topic "bare properties" and 
 * their sibling properties along with all the topic's types's properties
 * that meet the constraint of the options parameter filters.
 */

function topic_structure(id, options) {
    options = options || {};
    var lang = options.lang || "/lang/en";
    var domain_filter, type_filter, prop_filter;
    var api_options = {
        lang: h.lang_code(i18n.get_lang(true, lang))
    };
    if (options.domain === "all") {
        api_options.filter = ["all"];
    }
    else if (is_mql_id(options.domain)) {
        domain_filter = options.domain;
        api_options.filter = [options.domain];
        api_options.limit = 20;
    }
    else if (is_mql_id(options.type)) {
        type_filter = options.type;
        api_options.filter = [options.type];
        api_options.limit = 100;
    }
    else if (is_mql_id(options.property)) {
        prop_filter = options.property;
        api_options.filter = [options.property];
        api_options.limit = 200;
    }
    else {
        api_options.filter = ["commons"];
    }
    return freebase.get_topic(id, api_options)
        .then(function(topic_result) {
            var domain_count = options.linkcount;
            var topic_props = topic_result && topic_result.property;
            if (topic_props) {
                // Get all instanceof types and asserted props (bareprops)
                // to determine what types to display

                // These are actual instanceof types
                var instanceof_types = topic_props && topic_props["/type/object/type"];
                instanceof_types = instanceof_types && instanceof_types.values;

                // Gather up all asserted properties' types
                var types = [];
                var types_seen = {};
                var no_filters = !(options.domain || options.type || options.property);
                for (var pid in topic_props) {
                    // skip reverse properties (!/.../.../...)
                    var t = h.id_key(pid, true)[0];
                    if (t[0] === "/") {
                        // Don't show /type/object properties unless explicity asked
                        if (no_filters && (t === "/type/object")) {
                            continue;
                        }
                        if (t && !types_seen[t]) {
                            types.push(t);
                            types_seen[t] = true;
                        }
                    }
                }

                // Now merge instanceof types and asserted properties' types
                if (instanceof_types) {
                    instanceof_types.forEach(function(t) {
                        var id = t.id;
                        if (id && !types_seen[id]) {
                            types.push(id);
                            types_seen[id] = true;
                        }
                    });
                }

                if (types.length) {
                    // If domain, type, or prop filter, only get the type(s)
                    // corresponding to the filter
                    if (domain_filter) {
                        // filter by domain
                        var prefix = domain_filter + "/";
                        types = types.filter(function(t) {
                            return t.indexOf(prefix) === 0;
                        });
                    }
                    else if (type_filter) {
                        // filter by type
                        types = types.filter(function(t) {
                            return t === type_filter;
                        });
                    }
                    else if (prop_filter) {
                        var prefix = h.id_key(prop_filter, true)[0];
                        types = types.filter(function(t) {
                           return prefix === t;
                        });
                    }
                    else if (options.domain !== "all") {
                        types = types.filter(function(t) {
                            return h.is_commons_domain(t);
                        });
                    }
                }
                if (types.length) {
                    return typeloader.loads(types, lang)
                        .then(function(typeloader_result) {
                            var structure = get_structure(typeloader_result, domain_count, lang);
                            if (prop_filter) {
                                var show_prop = structure.properties[prop_filter];
                                if (show_prop) {
                                    structure.properties = {};
                                    structure.properties[prop_filter] = show_prop;
                                }
                            }
                            topic_result.structure = structure;
                            return topic_result;
                        });
                }
            }
            topic_result.structure = to_structure([], lang);
            return topic_result;
        });
};

function is_mql_id(id) {
    var mqlid = validators.MqlId(id, {if_invalid:null, if_empty:null});
    return mqlid != null;
};

/**
 * Get a structure that is easy to iterate from 
 * a list of domains -> types -> properties.
 * The domains and types will be sorted by
 * a topic's linkcount.
 *
 * @param types:Object - a dictionary of types returned by typeloader.load()
 * @param linkcount:Array - a list of types sorted by their notablility.
 * @param lang
 * @return a list of domains and their types sorted by linkcount
 */
function get_structure(types_by_id, domain_count, lang) {
  var domains_list = sort_domains_and_types_by_linkcount(types_by_id, domain_count);
  return to_structure(domains_list, lang);
};


/**
 * Convert a map of types by their ids to a sorted list of domains 
 * and their types where the domains and types will be sorted by
 * their respective linkcounts.
 */
function sort_domains_and_types_by_linkcount(types_by_id, domain_count) {
    var linkcount_by_domain = {};
    var linkcount_by_type = {};
    var linkcount_by_prop = {};
    if (domain_count) {
        domain_count.forEach(function(domain) {
            linkcount_by_domain[domain.id] = domain.count;
            var types = domain.values || [];
            types.forEach(function(type) {
                linkcount_by_type[type.id] = type.count;
                var props = type.values || [];
                props.forEach(function(prop) {
                    linkcount_by_prop[prop.id] = prop.count;
                });
            });
        });
    }
    // bucket all types into their respective domains
    var domains_list = [];
    var domains_by_id = {};
    for (var type_id in types_by_id) {
        var type = types_by_id[type_id];
        var domain_id = type.domain.id;
        var domain = domains_by_id[domain_id];
        if (!domain) {
            domain = domains_by_id[domain_id] = h.extend(true, {types:[]}, type.domain);
            domains_list.push(domain);
        }
        domain.types.push(type);
    }
    // now sort all types by type linkcount
    domains_list.forEach(function(domain) {
        domain.types.sort(function(a, b) {
            return compare_linkcount(linkcount_by_type, a, b);
        });
    });
    // now sort all domains by domain linkcount
    return domains_list.sort(function(a, b) {
        return compare_linkcount(linkcount_by_domain, a, b);
    });
};

function compare_linkcount(linkcount_by_id, a, b) {
  var a_count = linkcount_by_id[a.id];
  var b_count = linkcount_by_id[b.id];
  if (!(a_count == null || b_count == null)) {
    return b_count - a_count;
  }
  else if (a_count == null && b_count === null) {
    return 0;
  }
  else if (a_count == null) {
    return 1;
  }
  else if (b_count == null) {
    return -1;
  }
};


/**
 * Transform a domains list to a usable structure
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
      text: domain_name ? domain_name.value : domain.id,
      lang: domain_name ? domain_name.lang : null,
      types: []
    };
    domain.types.forEach(function(type) {
      domain_structure.types.push(type.id);
      var type_name = i18n.mql.get_text(lang, type.name);
      var type_structure = structure.types[type.id] = {
        text: type_name ? type_name.value : type.id,
        lang: type_name ? type_name.lang : null,
        properties: []
      };
      type.properties.forEach(function(prop) {
        type_structure.properties.push(prop.id);
        var prop_structure = structure.properties[prop.id] = ph.to_prop_structure(prop, lang);
      });
    });
  });
  return structure;
};



