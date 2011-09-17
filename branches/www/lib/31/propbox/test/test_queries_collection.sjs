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

acre.require('/test/lib').enable(this);

acre.require("test/mock").playback(this, "propbox/test/playback_test_queries_collection.json");

var h = acre.require("helper/helpers.sjs");
var qc = acre.require("propbox/queries_collection.sjs");

test("collection", function() {
  var topic_ids = ["/en/milla_jovovich", "/en/angus_macfadyen"];
  var pids = ["/type/object/name", "/film/film/starring"];
  var result;
  qc.collection(topic_ids, pids)
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result, "Got collection result");
  var structures = result.structures;
  var values = result.values;
  ok(structures && structures.length === 2, "Got collection prop structures");
  same(structures[0].id, "/type/object/name");
  same(structures[1].id, "/film/film/starring");
  ok(values && values.length === 2, "Got collection values");
  same(values[0].id, "/en/milla_jovovich");
  same(values[1].id, "/en/angus_macfadyen");
});

test("collection property paths", function() {
  var topic_ids = ["/en/milla_jovovich", "/en/angus_macfadyen"];
  var pids = [
    "/type/object/name",
    "/film/actor/film./film/performance/film",
    "/film/actor/film./film/performance/character"
  ];
  var result;
  qc.collection(topic_ids, pids)
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result, "Got collection result");
  var structures = result.structures;
  var values = result.values;
  ok(structures && structures.length === 2, "Got collection prop structures");
  same(structures[0].id, "/type/object/name");
  same(structures[1].id, "/film/actor/film");
  ok(structures[1].properties && structures[1].properties.length === 2, "Got subproperties");
  same(structures[1].properties[0].id, "/film/performance/film");
  same(structures[1].properties[1].id, "/film/performance/character");
  ok(values && values.length === 2, "Got collection values");
  same(values[0].id, "/en/milla_jovovich");
  same(values[1].id, "/en/angus_macfadyen");
});


acre.test.report();
