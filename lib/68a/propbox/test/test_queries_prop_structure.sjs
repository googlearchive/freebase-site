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

acre.require('/test/lib').enable(this);

acre.require("test/mock")
    .playback(this, "propbox/test/playback_test_queries_prop_structure.json");

var h = acre.require("helper/helpers.sjs");
var queries = acre.require("propbox/queries.sjs");

test("prop_structure", function() {
  var pids = [
    "/government/us_president/presidency_number", "/type/int",
    "/government/us_president/vice_president", "/government/us_vice_president",
    "/type/object/name", "/type/text",
    "/measurement_unit/dated_integer/year", "/type/datetime"
  ];
  for (var i=0,l=pids.length; i<l; i+=2) {
    (function() {
       var pid = pids[i];
       var ect = pids[i+1];
       var structure;
       queries.prop_structure(pid, "/lang/en")
         .then(function(s) {
           structure = s;
         });
       acre.async.wait_on_results();
       ok(structure, "Got " + pid + " structure");
       same(structure.id, pid);
       same(structure.expected_type.id, ect);
     })();
  }
});

test("prop_structures", function() {
  var pids = [
    "/government/us_president/presidency_number",
    "/government/us_president/vice_president",
    "/type/object/name",
    "/measurement_unit/dated_integer/year"
  ];
  var structures;
  queries.prop_structures(pids, "/lang/en")
    .then(function(s) {
      structures = s;
    });
  acre.async.wait_on_results();
  ok(structures && structures.length === pids.length, "Got all structures");
  var ids = h.map_array(structures, "id");
  for (var i=0,l=pids.length; i<l; i++) {
    ok(ids[pids[i]], pids[i]);
  }
});

acre.test.report();
