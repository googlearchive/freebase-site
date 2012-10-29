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
var deferred = apis.deferred;
var freebase = apis.freebase;

var SCHEMA_KEY_PREFIX = "schema:";

var cache_impl = acre.cache.request;

/**
 * Invalidate a single type and
 * all of its lang enumerations from the schema cache.
 *
 * @param type_ids:String or Array - A single type id or a list of type ids.
 */
function invalidate(type_ids) {
    if (h.type(type_ids) !== "array") {
        type_ids = [type_ids];
    }
    // need to get all (lang)x(type_ids) combination
    var keys = [];
    for (var i=0,l=i18n.LANGS.length; i<l; i++) {
        keys = keys.concat(cache_keys(type_ids, i18n.LANGS[i].id));
    }
    cache_impl.removeAll(keys);
};


/**
 * Load a single type schema in the specified lang.
 * A type schema is consisted of all of it's metadata and
 * all of it's properties and its metadata.
 * Typeloader will decend into the types' properties' expected_type properties
 * (deep) only if the expected_type is a "mediator".
 * All expected_types at the leaf nodes will contain all of it's metadata
 * (i.e., /freebase/type_hints/*, name, domain, etc.)
 * but never the properties list.
 *
 * type -> properties -> expected_type[mediator=false]
 * type -> properties -> expected_type[mediator=true] -> properties[disambiguator=true] -> expected_type
 *
 * @param type_id:String - A mql id
 * @param lang:String - A mql lang id. Defaults to /lang/en.
 * @return a Promise that resolves to a type schema object in the specified lang.
 */
function load(type_id, lang) {
    return loads([type_id], lang)
        .then(function(types) {
            return types[type_id];
        });
};

/**
 * @see load() but loads multiple types.
 *
 * @param type_ids:Array - A list of mql ids.
 * @param lang:String - A mql lang id. Defaults to /lang/en
 * @return a Promise the resolves to a map of type schema objects
 *         keyed by the type id.
 */
function loads(type_ids, lang) {
    return _loads(type_ids, lang)
        .then(function(types) {
            var ect_props = {}; // ect_id => list of properties with ect_id
            var ect_ids = [];
            // Now gather up all properties' expected types to load
            for (var type_id in types) {
                var type = types[type_id];
                type.properties.forEach(function(prop) {
                    var ect = prop.expected_type;
                    if (ect == null) {
                        ect = prop.expected_type = {id:"/type/object"};
                    }
                    if (!ect_props[ect.id]) {
                        ect_props[ect.id] = [];
                        ect_ids.push(ect.id);
                    }
                    ect_props[ect.id].push(prop);
                });
            }
            if (ect_ids.length) {
                return _loads(ect_ids, lang)
                    .then(function(expected_types) {
                        var deep_ect_props = {};
                        var deep_ect_ids = [];
                        for (var ect_id in expected_types) {
                            var ect = expected_types[ect_id];
                            // mediator?
                            if (ect["/freebase/type_hints/mediator"] === true &&
                                ect.properties) {
                                // only get disambiguating properties
                                ect.properties = ect.properties.filter(function(p) {
                                    return p["/freebase/property_hints/disambiguator"] === true;
                                });
                                ect.properties.forEach(function(prop) {
                                    var deep_ect = prop.expected_type;
                                    if (deep_ect == null) {
                                        deep_ect = prop.expected_type = {id:"/type/object"};
                                    }
                                    var deep_props = deep_ect_props[deep_ect.id];
                                    if (!deep_props) {
                                        deep_props = deep_ect_props[deep_ect.id] = [];
                                        deep_ect_ids.push(deep_ect.id);
                                    }
                                    deep_props.push(prop);
                                });
                            }
                            else {
                                // don't return subproperties
                                delete ect.properties;
                            }
                            var props = ect_props[ect_id];
                            if (props) {
                                props.forEach(function(prop) {
                                    prop.expected_type = ect;
                                });
                            }
                        }
                        if (deep_ect_ids.length) {
                            return _loads(deep_ect_ids, lang)
                                .then(function(deep_expected_types) {
                                    for (var deep_ect_id in deep_expected_types) {
                                        var deep_ect = deep_expected_types[deep_ect_id];
                                        // Don't recurse into deep-deep properties.
                                        // It ends here.
                                        delete deep_ect.properties;
                                        var deep_props = deep_ect_props[deep_ect_id];
                                        if (deep_props) {
                                            deep_props.forEach(function(prop) {
                                                prop.expected_type = deep_ect;
                                            });
                                        }
                                    }
                                    return types;
                                });
                        }
                        return types;
                    });
            }
            return types;
        });
};

function _loads(type_ids, lang) {
    var result = {};
    var not_cached = [];
    // keys[i] is the cache key of type_ids[i]
    var keys = cache_keys(type_ids, lang);
    var cached = cache_impl.getAll(keys);
    keys.forEach(function(key, i) {
        var type_id = type_ids[i];
        if (key in cached) {
            result[type_id] = cached[key];
        }
        else {
            not_cached.push(type_id);
        }
    });
    var d;
    if (not_cached.length) {
        d = do_mql(not_cached, lang)
            .then(function(types) {
                var to_put = {};
                types.forEach(function(type) {
                    result[type.id] = type;
                    to_put[cache_key(type.id)] = type;
                });
                cache_impl.putAll(to_put);
                return result;
            });
    }
    else {
        d = deferred.resolved(result);
    }
    return d;
};

function cache_key(type_id, lang) {
    lang = lang || "/lang/en";
    return SCHEMA_KEY_PREFIX + type_id + ":" + h.lang_code(lang);
};

function cache_keys(type_ids, lang) {
    return type_ids.map(function(type_id) {
        return cache_key(type_id, lang);
    });
};

function assert(truthy, msg) {
    if (!truthy) {
        var msg_args = Array.prototype.slice.call(arguments, 1);
        throw msg_args.join(" ");
    }
};

/**
 * This is the canonical schema query and is what get's stored in the cache
 * per type/lang pair.
 */
function do_mql(type_ids, lang) {
    lang = lang || "/lang/en";
    var q = [{
        id: null,
        "id|=": type_ids,
        name: i18n.mql.text_clause(lang),
        "/common/topic/description": i18n.mql.text_clause(lang),
        type: "/type/type",
        guid: null,
        mid: null,
        key: [{
          value: null,
          namespace: null
        }],
        domain: {
            id: null,
            name: i18n.mql.text_clause(lang),
            type: "/type/domain",
            "/freebase/domain_profile/category": {
                // is this "Commons" domain?
                optional: true,
                id: "/category/commons"
            }
        },
        "/freebase/type_hints/mediator": null,
        "/freebase/type_hints/included_types": [],
        "/freebase/type_hints/enumeration": null,
        "/freebase/type_hints/never_assert": null,
        "/freebase/type_hints/deprecated": null,
        properties: [{
            optional: true,
            id: null,
            key: [{
              value: null,
              namespace: null
            }],
            name: i18n.mql.text_clause(lang),
            "/common/topic/description": i18n.mql.text_clause(lang),
            type: "/type/property",
            "emql:type": {
                optional: true,
                id: "/type/extension"
            },
            schema: {
                id: null
            },
            unique: null,
            unit: {
                optional: true,
                id: null,
                type: "/type/unit",
                "/freebase/unit_profile/abbreviation": null
            },
            requires_permission: null,
            authorities: {
              optional: true,
              id: null,
              "id!=": "/boot/all_permission",
              permits: [{
                id: null,
                member: [{
                  id: null
                }]
              }]
            },
            "/freebase/property_hints/disambiguator": null,
            "/freebase/property_hints/display_none": null,
            "/freebase/property_hints/deprecated": null,
            master_property: {
                optional: true,
                id: null,
                type: "/type/property"
            },
            reverse_property: {
                optional: true,
                id: null,
                type: "/type/property"
            },
            enumeration: {
                optional: true,
                id: null,
                type: "/type/namespace"
            },
            delegated: {
                optional: true,
                id: null,
                type: "/type/property"
            },
            expected_type: {
                optional: true,
                id: null,
                type: "/type/type"
            },
            index: null,
            sort: "index"
        }]
    }];
    return freebase.mqlread(q)
        .then(function(env) {
            return env.result;
        });
};
