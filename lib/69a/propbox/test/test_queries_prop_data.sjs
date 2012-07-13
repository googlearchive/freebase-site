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
    .playback(this, "propbox/test/playback_test_queries_prop_data.json");

var h = acre.require("helper/helpers.sjs");
var queries = acre.require("propbox/queries.sjs");

test("prop_data", function() {
  var pid = "/tv/tv_writer/tv_programs";
  var structure;
  queries.prop_structure(pid, "/lang/en")
    .then(function(s) {
      structure = s;
    });
  acre.async.wait_on_results();
  var data;
  queries.prop_data("/en/trey_parker", pid, null, "/lang/en")
    .then(function(d) {
      data = d;
    });
  acre.async.wait_on_results();
  ok(data && data.length, "Got prop data");
  var south_park;
  data.every(function(d) {
    var program = 
        h.first_element(d["/tv/tv_program_writer_relationship/tv_program"]);
    if (program.id === "/en/south_park") {
      south_park = program;
      return false;
    }
    return true;
  });
  ok(south_park, "Found /en/south_park");

  // should get the same data if we already have prop structure
  var data2;
  queries.prop_data("/en/trey_parker", structure, null, "/lang/en")
    .then(function(d) {
      data2 = d;
    });
  acre.async.wait_on_results();
  same(data2, data);
});

acre.test.report();
