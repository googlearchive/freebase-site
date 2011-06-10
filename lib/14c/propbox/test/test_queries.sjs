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

acre.require("test/mock").playback(this, "propbox/test/playback_test_queries.json");

var h = acre.require("helper/helpers.sjs");
var queries = acre.require("propbox/queries.sjs");

test("prop_schema", function() {
  var pids = [
    "/people/person/date_of_birth", "/type/datetime",
    "/type/object/name", "/type/text",
    "/people/person/place_of_birth", "/location/location",
    "/film/film/starring", "/film/performance"
  ];
  for (var i=0,l=pids.length; i<l; i+=2) {
    (function() {
       var pid = pids[i];
       var ect = pids[i+1];
       var schema;
       queries.prop_schema(pid, "/lang/en")
         .then(function(s) {
           schema = s;
         });
       acre.async.wait_on_results();
       ok(schema, "Got " + pid + " schema");
       same(schema.id, pid);
       same(schema.expected_type.id, ect);
     })();
  }
});

test("prop_schemas", function() {
  var pids = [
    "/people/person/date_of_birth",
    "/type/object/name",
    "/people/person/place_of_birth",
    "/film/film/starring"
  ];
  var schemas;
  queries.prop_schemas.apply(null, pids.concat(["/lang/en"]))
    .then(function(s) {
      schemas = s;
    });
  acre.async.wait_on_results();
  ok(schemas && schemas.length === pids.length, "Got all schemas");
  var ids = h.map_array(schemas, "id");
  for (var i=0,l=pids.length; i<l; i++) {
    ok(ids[pids[i]], pids[i]);
  }
});


test("prop_structure", function() {
  var pids = [
    "/people/person/date_of_birth", "/type/datetime",
    "/type/object/name", "/type/text",
    "/people/person/place_of_birth", "/location/location",
    "/film/film/starring", "/film/performance"
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
    "/people/person/date_of_birth",
    "/type/object/name",
    "/people/person/place_of_birth",
    "/film/film/starring"
  ];
  var structures;
  queries.prop_structures.apply(null, pids.concat(["/lang/en"]))
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

test("prop_data", function() {
  var pid = "/film/film/starring";
  var structure;
  queries.prop_structure(pid, "/lang/en")
    .then(function(s) {
      structure = s;
    });
  acre.async.wait_on_results();
  var data;
  queries.prop_data("/en/blade_runner", pid, null, "/lang/en")
    .then(function(d) {
      data = d;
    });
  acre.async.wait_on_results();
  ok(data && data.length, "Got prop data");
  var harrison_ford;
  data.every(function(d) {
    var actor = h.first_element(d["/film/performance/actor"]);
    if (actor.id === "/en/harrison_ford") {
      harrison_ford = actor;
      return false;
    }
    return true;
  });
  ok(harrison_ford, "Found /en/harrison_ford");

  // should get the same data if we already have prop structure
  var data2;
  queries.prop_data("/en/blade_runner", structure, null, "/lang/en")
    .then(function(d) {
      data2 = d;
    });
  acre.async.wait_on_results();
  same(data2, data);
});

test("prop_values", function() {
  var pid = "/film/film/starring";
  var structure;
  queries.prop_structure(pid, "/lang/en")
    .then(function(s) {
      structure = s;
    });
  acre.async.wait_on_results();
  var values;
  queries.prop_values("/en/blade_runner", pid, null, "/lang/en")
    .then(function(d) {
      values = d;
    });
  acre.async.wait_on_results();
  ok(values && values.length, "Got prop data");
  var harrison_ford;
  values.every(function(d) {
    var actor = h.first_element(d["/film/performance/actor"].values);
    if (actor.id === "/en/harrison_ford") {
      harrison_ford = actor;
      return false;
    }
    return true;
  });
  ok(harrison_ford, "Found /en/harrison_ford");

  // should get the same data if we already have prop structure
  var values2;
  queries.prop_values("/en/blade_runner", structure, null, "/lang/en")
    .then(function(d) {
      values2 = d;
    });
  acre.async.wait_on_results();
  same(values2, values);
});

test("get_enumerated_types", function() {
  var pid = "/people/person/gender";
  var structure;
  queries.prop_structure(pid, "/lang/en")
    .then(function(s) {
      structure = s;
    });
  acre.async.wait_on_results();

  var genders;
  queries.get_enumerated_types(pid, "/lang/en")
    .then(function(s) {
      genders = h.first_element(s).expected_type.instances;
    });
  acre.async.wait_on_results();
  ok(genders && genders.length, "Got genders");
  var gender_map = h.map_array(genders, "id");
  ok(gender_map["/en/male"], "Got gender /en/male");
  ok(gender_map["/en/female"], "Got gender /en/female");

  // should get the same data if we already have prop structure
  var genders2;
  queries.get_enumerated_types(structure, "/lang/en")
    .then(function(s) {
      genders2 = h.first_element(s).expected_type.instances;
    });
  acre.async.wait_on_results();
  same(genders2, genders);
});


test("get_enumerated_types for mediator", function() {
  var pid = "/film/film/starring";
  var structure;
  queries.get_enumerated_types(pid, "/lang/en")
    .then(function(s) {
      structure = h.first_element(s);
    });
  acre.async.wait_on_results();
  var special_performance_types;
  structure.properties.every(function(p) {
    if (p.id === "/film/performance/special_performance_type") {
      special_performance_types = p.expected_type.instances;
      return false;
    }
    return true;
  });
  ok(special_performance_types && special_performance_types.length, "Got special_performance_types");
  var spt_map = h.map_array(special_performance_types, "id");
  ok(spt_map["/en/cameo_appearance"]);
});

acre.test.report();
