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
var freebase = acre.require("promise/apis").freebase;

/**
 * Check if the topic (topic_id) types are incompatible with a type (type_id).
 * Currently this checks the /dataworld/incompatible_types instances in the graph.
 * Returns a list of the topic type ids that are incompatible with type_id.
 * If EMPTY, it can be safely assumed to type topic_id with type_id.
 */
function incompatible_types(topic_id, type_id) {
  var q = [{
    id: null,
    type: "/dataworld/incompatible_types",
    "existing:types": {
      id: null,
      "/type/type/instance": {
        id: topic_id
      }
    },
    "incompatible:types": {
      id: type_id
    },
    optional: true
  }];
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      var incompatibles = [];
      for (var i=0,l=result.length; i<l; i++) {
        var data = result[i];
        var existing = data["existing:types"].id;
        if (existing !== type_id) {
          incompatibles.push(existing);
        }
      }
      return incompatibles;
    });
};
