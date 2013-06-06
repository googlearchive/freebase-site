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

function delete_domain(domain_id, user_id) {
    return domain_info(domain_id, user_id)
        .then(function(info) {
            if (!info.has_permission) {
                return deferred.rejected(h.sprintf("User %s does not have permission on %s", user_id, domain_id));
            }
            else if (info.types.length) {
                return deferred.rejected(h.sprintf("You must first delete all types in %s", domain_id));
            }
            else if (info["not_permitted:key"].length) {
                return deferred.rejected(h.sprintf("User %s does not have permission to remove the domain from the following namespace(s): %s"), user_id, info["not_permitted:key"].map(function(k) {return k.namespace;}).join(", "));
            }
            var q = {
                id: info.guid, // use guid since we're deleting keys                
                type: {id:"/type/domain", connect:"delete"}
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
                    // do we need to remove /base keys?
                    // if so, use fb_writeuser
                    if (info["base:key"].length) {
                        h.enable_writeuser();
                        q = {
                            id: info.guid,
                            key: info["base:key"].map(function(k) {
                                return {
                                    namespace: k.namespace,
                                    value: k.value,
                                    connect: "delete"
                                };
                            })
                        };
                        return freebase.mqlwrite(q, null, {
                            http_sign: "keystore"
                        })
                        .then(function(env) {
                            return info;
                        });                        
                    }
                    else {
                        return info;
                    }
                });
        });
};

/**
 * A query to check if a domain is being "used" and the user
 * has permission to possibly delete the domain.
 */
function domain_info(domain_id, user_id) {
    var q = {
        id: domain_id,
        guid: null,
        /**
         * Can't delete domains with types. Delete the types first
         */
        "/type/domain/types": [],
        /**
         * Are there any /base key(s)? 
         * We need to remove these with fb_writeuser.
         */
        "base:key": [{
            optional: true,
            namespace: "/base",
            value: null
        }],
        /**
         * Can't delete domains with key(s) in namespace(s)
         * that the user does not have permission on (except /base).
         */
        "other:key": [{
            optional: true,
            namespace: {
                id: null,                
                permission: [{optional:true, permits: [{member: {id: user_id}}]}]
            },
            "forbid:namespace": {
                id: "/base",
                optional: "forbidden"
            },
            value: null
        }],
        /**
         * Can't delete domains that the user does not have permission on
         */
        permission: [{optional:true, permits: [{member: {id: user_id}}]}]
    };
    return freebase.mqlread(q)
        .then(function(env) {
            var r = env.result;
            r.types = r["/type/domain/types"];
            r.has_permission = r.permission.length ? true : false;

            r["permitted:key"] = [];
            r["not_permitted:key"] = [];

            r["other:key"].forEach(function(k) {
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
