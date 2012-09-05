/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binar]y forms, with or without
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
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var typeloader = acre.require("schema/typeloader.sjs");
var assert = typeloader.assert;
var validators = acre.require("validator/validators.sjs");

/**
 * Load a single property schema in the specified lang.
 * A property schema is consisted of all of it's metadata and
 * all of it's expected_type's metadata.
 * Proploader will decend into it's expected_type properties
 * (disambiguator) only if the expected_type is a "mediator".
 * All expected_types at the leaf nodes will contain all of it's metadata
 * (i.e., /freebase/type_hints/*, name, domain, etc.) 
 * but never the properties list.
 * 
 * property -> expected_type[mediator=false]
 * properties -> expected_type[mediator=true] -> properties[disambiguator=true] -> expected_type
 * 
 * @param prop_id:String - A mql id
 * @param lang:String - A mql lang id. Defaults to /lang/en
 * @return a Promise that resolves to a property schema object.
 */
function load(prop_id, lang) {
    return loads([prop_id], lang)
        .then(function(props) {
            return props[prop_id];
        });
};

/**
 * @see load() but loads multiple properties.
 * 
 * @param prop_ids:Array - A list of mql ids.
 * @param lang:String - A mql lang id. Defaults to /lang/en
 * @return a Promise the resolves to a result object key'ed 
 *         by the specified prop_ids
 */
function loads(prop_ids, lang) {
    var result = {};
    var type_ids = [];
    var seen = {};
    prop_ids.forEach(function(prop_id) {
        result[prop_id] = null; // mark property in the result to retrieve for later
        var type_id = h.id_key(prop_id, true)[0];
        if (type_id &&
            !/^\/[mg]$/.test(type_id) && // for mids, do an actual schema query to get the type_id later
            !seen[type_id]) {            
            type_ids.push(type_id);
            seen[type_id] = true;
        }
    });
    return typeloader.loads(type_ids, lang)
        .then(function(types) {
            for (var type_id in types) {
                var type = types[type_id];
                type.properties.forEach(function(prop) {
                    if (prop.id in result) {
                        result[prop.id] = prop;
                    }
                });
            }
            return result;
        })
        .then(function(loaded) {
            // Did we load all the prop_ids?
            // If not, for each property that was NOT loaded,
            // try to load its /type/property/schema, instead
            // of relying on the property id prefix as the type.
            var not_loaded = prop_ids.filter(function(prop_id) {
                return !loaded[prop_id];
            });
            if (!not_loaded.length) {
                // Everything was loaded.
                return loaded;
            }
            var q = [{
                id: null,
                "id|=": not_loaded,
                type: "/type/property",
                key: [{
                    namespace: null,
                    value: null
                }],
                schema: {
                    id: null,
                    type: "/type/type"
                }
            }];
            return freebase.mqlread(q)
                .then(function(env) {
                    var not_loaded_props = env.result || [];
                    var sameas = {};
                    type_ids = [];
                    seen = {};
                    not_loaded_props.forEach(function(p) {
                        var type_id = p.schema.id;
                        if (!seen[type_id]) {
                            type_ids.push(type_id);
                            seen[type_id] = true;
                        }
                        // We want to keep track of all the 
                        // ids that resolve to the same property
                        // by inspecting all of the key namespace, value pairs.
                        sameas[p.id] = p.id;
                        p.key.forEach(function(k) {
                            var pid = k.namespace + "/" + k.value;
                            sameas[pid] = p.id;
                        });
                    });
                    return typeloader.loads(type_ids, lang)
                        .then(function(types) {
                            for (var type_id in types) {
                                var type = types[type_id];
                                type.properties.forEach(function(prop) {
                                    if (sameas[prop.id]) {
                                        loaded[sameas[prop.id]] = prop;
                                    }
                                });
                            }
                            return loaded;
                        });
                });
        });
};

/**
 * Load a list of heterogenous property paths.
 * 
 * A property path can either be a SINGLE fully qualified property id
 * or consisted of TWO properties delimited by the '.' character. 
 * The "first" property must always be fully qualified. For example:
 * 
 * "/film/film/starring"
 * "/film/film/directed_by./people/person/date_of_birth"
 * "/people/person/spouse_s.spouse"
 * 
 * Note that the "second" property can either be a fully qualified property id 
 * (i.e., "/people/person/date_of_birth" in "/film/film/directed_by./people/person/date_of_birth")
 * or a relative property key (i.e., "spouse" in "/people/person/spouse_s.spouse").
 * If it's relative, the full id is assumed to be the contatenation of the "first"
 * property's expected_type id and the property key. For instance, 
 * the expected_type of "/people/person/spouse_s" is "/people/marriage", thus the
 * full id of the "second" property in "/people/person/spouse_s.spouse" is
 * "/people/marriage/spouse".
 * 
 * The result will be a map of property schemas keyed by the "first" property ids.
 * 
 * For example, the paths: 
 * [
 *   "/film/film/directed_by./type/object/name", 
 *   "/film/film/directed_by./people/person/date_of_birth",
 *   "/film/film/starring"
 * ]
 * will result in 2 schemas keyed by "/film/film/directed_by" and "/film/film/starring".
 * "/film/film/starring" will contain the default property schema you would expect from
 * proploader.load("/film/film/starring"). However, "/film/film/directed_by" schema
 * will be what you would expect from proploader.load("/film/film/directed_by")
 * with the caveat that the "second" properties will be "stitched" into its schema
 * as the expected_type properties:
 * 
 * {
 *   ...
 *   "/film/film/directed_by": {
 *     ...
 *     expected_type: {
 *       ...
 *       properties: [{
 *         id: "/type/object/name",
 *         ...
 *       }, {
 *         id: "/people/person/date_of_birth",
 *         ...
 *       }]
 *     }
 *   }
 * }
 */
function load_paths(paths, lang) {
    var i,l;
    var path_map = {};
    var prop_ids = [];
    var seen = {};
    paths.forEach(function(path) {
        // only 2 level path is supported
        var parts = path.split(".", 2);
        if (parts.length) {
            var first = parts[0];            
            assert(first[0] === "/", "First property path must be fully qualified");
            if (!seen[first]) {
                prop_ids.push(first);
                seen[first] = true;
            }
            path_map[path] = [first];
            var second = null;
            if (parts.length === 2) {
                second = parts[1];
                if (second[0] === "/") {
                    if (!seen[second]) {
                        prop_ids.push(second);
                        seen[second] = true;
                    }
                }
                // else is relative. 
                // We need to get this on the second pass by inspecting
                // the expected_type + properties
                path_map[path].push(second);
            }
        }
    });
    var result = {};
    if (!prop_ids.length) {
        return deferred.resolved(result);
    }
    return loads(prop_ids, lang)
        .then(function(props) {
            // relative ids we need to load (i.e., actor in /film/film/starring.actor)
            // The fully qualified is the first propety's expected_type id + the relative key.
            // (i.e., /film/performance + actor)
            var relative_ids = [];
            var relative_map = {};
            paths.forEach(function(path, i) {
                var parts = path_map[path];
                var first = parts[0];
                var prop1 = props[first];                              
                assert(prop1, "First property did not load", first);
                // props[first] needs to be immutable, since other paths
                // may refer to it so clone it.
                prop1 = h.extend(true, {}, prop1);
                if (!result[first]) {
                    result[first] = prop1;
                    prop1._properties = [];
                }
                if (parts.length === 2) {
                    var second = parts[1];
                    var prop2;
                    if (second[0] === "/") {
                        prop2 = props[second];
                        assert(prop2, "Second property did not load", second);
                        prop2 = h.extend(true, {}, prop2);
                        if (!prop2.expected_type["/freebase/type_hints/mediator"]) {
                            // Nested (sub) mediator is not yet supported
                            result[first]._properties[i] = prop2;
                        }
                        // Arbitrary depth not yet supported
                        delete prop2.expected_type.properties;
                    }
                    else {
                        // relative id are prefixed with the first prop's 
                        // expcted_type id to get the fully qualified property id
                        var full_second = prop1.expected_type.id + "/" + second;
                        // need to refer back to first property later
                        relative_ids.push(full_second);
                        if (!relative_map[full_second]) {
                            relative_map[full_second] = [];
                        }
                        // we keep track of the index because the sub properties
                        // should adhere to the order of the paths list
                        relative_map[full_second].push([i, result[first]]);
                    }
                }
                else if (prop1.expected_type.properties) {                    
                    prop1.expected_type.properties.forEach(function(subprop) {
                        // Arbitrary depth not yet supported
                        assert(!subprop.expected_type.properties || subprop.expected_type.properties.length === 0,
                               "Arbitrary depth not supported: " + path);
                    });
                }
            });
            function get_result() {
                for (var key in result) {
                    var prop = result[key];
                    var subprops = prop._properties;
                    if (subprops && subprops.length) {
                        subprops = subprops.filter(function(i) {
                            return i != null;
                        });
                        prop.expected_type.properties = subprops;
                    }
                    // else prop.expected_type.properties should all be disambiguators from typeloader
                    delete prop._properties;
                }
                return result;
            }
            if (relative_ids.length) {
                return loads(relative_ids, lang)
                    .then(function(props) {
                        relative_ids.forEach(function(relative_id) {
                            var prop2 = props[relative_id];
                            assert(prop2, "Second property did not load", relative_id);
                            var prop2 = h.extend(true, {}, prop2);
                            if (!prop2.expected_type["/freebase/type_hints/mediator"]) {
                                // Nested (sub) mediator is not yet supported
                                relative_map[relative_id].forEach(function(r) {
                                    var i = r[0];
                                    var prop1 = r[1];
                                    prop1._properties[i] = prop2;
                                });   
                            }       
                            // Arbitrary depth not yet supported
                            delete prop2.expected_type.properties;                  
                        });
                        return get_result();
                    });
            }
            else {
                return get_result();
            }
        });
};
