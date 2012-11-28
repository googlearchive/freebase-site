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

function delete_property(property_id, user_id) {
    return property_info(property_id, user_id)
        .then(function(info) {
            if (!info.has_permission) {
                return deferred.rejected(h.sprintf("User %s does not have permission on %s", user_id, property_id));
            }
            else if (info.links > 0) {
                return deferred.rejected(h.sprintf("You must first delete all %s links", property_id));
            }
            else if (info.reverse_property) {
                return deferred.rejected(h.sprintf("You must first remove the reverse_property %s", info.reverse_property));
            }
            else if (info.delegated_by > 0) {
                return deferred.rejected(h.sprintf("You must first remove all properties delegating from %s", property_id));
            }
            else if (info["not_permitted:key"].length) {
                return deferred.rejected(h.sprintf("User %s does not have permission to remove the property from the following namespace(s): %s"), user_id, info["not_permitted:key"].map(function(k) {return k.namespace;}).join(", "));
            }
            var q = {
                id: info.guid, // use guid since we're deleting keys                
                type: {id:"/type/property", connect:"delete"}
            };
            [
                "schema", 
                "expected_type", 
                "master_property", 
                "delegated", 
                "enumeration",
                "unit"
            ].forEach(function(k) {
                var pid = "/type/property/" + k;
                if (info[pid]) {
                    q[pid] = {id:info[pid].guid, connect:"delete"};
                }
            });
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
                    if (info.schema) {
                        typeloader.invalidate(info.schema);
                    }
                    return info;
                });
        });
};

/**
 * A query to check if a property is being "used" and the user
 * has permission to possibly delete the property.
 */
function property_info(property_id, user_id) {
    var q = {
        id: property_id,
        guid: null,
        "/type/property/schema": {
            optional: true,
            id: null,
            guid: null
        },
        "/type/property/expected_type": {
            optional: true,
            id: null,
            guid: null
        },
        "/type/property/master_property": {
            optional: true,
            id: null,
            guid: null
        },
        "/type/property/delegated": {
            optional: true,
            id: null,
            guid: null
        },
        "/type/property/enumeration": {
            optional: true,
            id: null,
            guid: null
        },
        "/type/property/unit": {
            optional: true,
            id: null,
            guid: null
        },
        /**
         * Can't delete properties that are being used for assertions/links.
         */
        "/type/property/links": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete properties with reverse_property
         */
        "/type/property/reverse_property": {
            optional: true,
            id: null
        },
        /**
         * Can't delete properties being delegated to.
         */
        "!/type/property/delegated": [{
            optional: true,
            "return": "count"
        }],
        /**
         * Can't delete properties with key(s) in namespace(s)
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
         * Can't delete properties that the user does not have permission on
         */
        permission: [{optional:true, permits: [{member: {id: user_id}}]}]
    };
    return freebase.mqlread(q)
        .then(function(env) {
            var r = env.result;
            [
                "schema", 
                "expected_type", 
                "master_property", 
                "delegated", 
                "enumeration",
                "unit",
                "reverse_property"
            ].forEach(function(k) {
                var pid = "/type/property/" + k;
                r[k] = r[pid] && r[pid].id || null;
            });
            r.links = r["/type/property/links"] || 0;
            r.delegated_by = r["!/type/property/delegated"] || 0;
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
