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
var freebase = acre.require("promise/apis").freebase;

/**
 * Check if the topic (topic_id) types are incompatible with a type (type_id).
 * Currently this checks the /dataworld/incompatible_types instances in the graph.
 * Return a map of incompatible types keyed by an existing type of topic_id
 * or null if the topic_id and type_id are "compatible".
 */
function incompatible_types(topic_id, type_id) {
    // first get inclucded types of type_id
    return freebase.mqlread({
        id: type_id,
        "/freebase/type_hints/included_types": []
    })
    .then(function(env) {
        var included_types = env.result["/freebase/type_hints/included_types"];
        var types = [type_id].concat(included_types);
        /**
         * Now look up if there are any /dataworld/incompatible_types mutexes
         * including any types of topic_id and the type_id (and it's included types).
         */
        var q = [{
             id: null,
             type: "/dataworld/incompatible_types",
             "existing:types": [{
                 id: null,
                 "/type/type/instance": {
                     id: topic_id
                 }
             }],
             "incompatible:types": [{
                 id: null,
                 "id|=": types
             }],
             optional: true
        }];
        return freebase.mqlread(q)
            .then(function(env) {
                if (env.result.length) {
                    var result = {
                        included_types: included_types
                    };
                    env.result.forEach(function(mutex) {
                        mutex["incompatible:types"].forEach(function(t1) {
                            var incompatible = result[t1.id];
                            if (!incompatible) {
                                incompatible =
                                    result[t1.id] = [];
                            }
                            mutex["existing:types"].forEach(function(t2) {
                                if (t1.id !== t2.id &&
                                    incompatible.indexOf(t2.id) === -1) {
                                    incompatible.push(t2.id);
                                }
                            });
                        });
                    });
                    // remove empty lsits
                    for (var k in result) {
                        if (!result[k].length) {
                            delete result[k];
                        }
                    }
                    if (h.isEmptyObject(result)) {
                        return null;
                    }
                    else {
                        return result;
                    }
                }
                else {
                    /**
                     * topic_id and type_id are "compatible" meaning
                     * that it's safe to assume to type topic_id with type_id
                     * and all of type_id's included types.
                     */
                    return null;
                }
            });
    });
};
