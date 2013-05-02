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

var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var h = acre.require("helper/helpers.sjs");
var typeloader = acre.require("schema/typeloader.sjs");

function delete_type(type_id, user_id) {
    return type_info(type_id, user_id)
        .then(function(info) {
            if (!info.has_permission) {
                return deferred.rejected(h.sprintf("User %s does not have permission on %s", user_id, type_id));
            }
            else if (info.properties > 0) {
                return deferred.rejected(h.sprintf("You must first delete all properties in %s", type_id));
            }
            else if (info.instance > 0) {
                return deferred.rejected(h.sprintf("You must first un-type all instances of %s", type_id));
            }
            else if (info.expected_by > 0) {
                return deferred.rejected(h.sprintf("You must first resolve all properties expecting %s", type_id));
            }
            else if (info.included_by > 0) {
                return deferred.rejected(h.sprintf("You must remove %s as an included type of %s type(s)", type_id, info.included_by));
            }
            else if (info["not_permitted:key"].length) {
                return deferred.rejected(h.sprintf("User %s does not have permission to remove the type from the following namespace(s): %s"), user_id, info["not_permitted:key"].map(function(k) {return k.namespace;}).join(", "));
            }
            var q = {
                id: info.guid, // use guid since we're deleting keys                
                type: {id:"/type/type", connect:"delete"}
            };
            if (info.domain) {
                q["/type/type/domain"] = {id:info.domain, connect:"delete"};
            };
            if (info["permitted:key"].length) {
                q.key = info["permitted:key"].map(function(k) {
                    return {
                        namespace: k.namespace,
                        value: k.value,
                        connect: "delete"
                    };
                });
            }
            return freebase.mqlwrite(q)
                .then(function(env) {
                    // invalidate type/schema cache
                    typeloader.invalidate(type_id);
                    return info;
                });
        });
};

/**
 * A query to check if a type is being "used" and the user
 * has permission to possibly delete the type.
 */
function type_info(type_id, user_id) {
    var q = {
        id: type_id,
        guid: null,
        "/type/type/domain": {
            optional: true,
            id: null
        },
        /**
         * Can't delete types with properties.
         * Delete the properties first.
         */
        "/type/type/properties": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete types with instance-of links.
         * Delete the instance-of links first.
         */
        "/type/type/instance": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete types that is /type/type/expected_by
         * other properties.
         */
        "/type/type/expected_by": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete types that are /freebase/type_hints/included_types
         * by other types
         */
        "!/freebase/type_hints/included_types": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete types with key(s) in namespace(s)
         * that the user does not have permission on.
         */
        key: [{
            optional: true,
            namespace: {
                id: null,                
                permission: [{optional:true, permits: [{member: {id: user_id}}]}]
            },
            value: null
        }],
        /**
         * Can't delete types that the user does not have permission on
         */
        permission: [{optional:true, permits: [{member: {id: user_id}}]}]
    };
    return freebase.mqlread(q)
        .then(function(env) {
            var r = env.result;
            r.domain = r["/type/type/domain"] && r["/type/type/domain"].id || null;
            r.properties = r["/type/type/properties"] || 0;
            r.instance = r["/type/type/instance"] || 0;
            r.expected_by = r["/type/type/expected_by"] || 0;
            r.included_by = r["!/freebase/type_hints/included_types"] = 0;
            r.has_permission = r.permission.length ? true : false;
            r["permitted:key"] = [];
            r["not_permitted:key"] = [];
            r["key"].forEach(function(k) {
                var key = {
                    namespace: k.namespace.id,
                    value: k.value
                };
                if (k.namespace.permission.length) {
                    r["permitted:key"].push(key);
                }
                else {
                    r["not_permitted:key"].push(key);
                }
           });
           return r;
        });
};
