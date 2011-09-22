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

var h = acre.require("helper/helpers.sjs");
var typeloader = acre.require("schema/typeloader.sjs");

function assert_type_schema(type_schema, type_id) {
  ok(type_schema, "Got type schema: " + type_id);
  [
    "id", "name",
    "/freebase/type_hints/enumeration",
    "/freebase/type_hints/mediator",
    "/freebase/type_hints/included_types",
    "properties"
  ].forEach(function(key) {
    ok(key in type_schema, "Expected type_schema " + key);
  });
  ok(h.isArray(type_schema.properties), "Expected type_schema properties");
  type_schema.properties.forEach(function(prop_schema) {
    //assert_prop_schema(prop_schema);
  });
};

function assert_prop_schema(prop_schema) {
  ok(prop_schema, "Expected property schema");
  [
    "id", "name", "unique", "unit",
    "/freebase/property_hints/disambiguator",
    "/freebase/property_hints/display_none",
    "master_property",
    "reverse_property",
    "expected_type"
  ].forEach(function(key) {
    ok(key in prop_schema, "Expected property schema " + key);
  });
};

function assert_key(obj, key, expected, msg) {
  ok(obj && key in obj &&
     (typeof expected === "boolean" ? !!obj[key] === expected : obj[key] === expected), msg);
};

test("_load", function() {
  // remove from cache
  var type_ids = ["/common/topic", "/type/text", "/common/document", "/common/image"];
  type_ids.forEach(function(type_id) {
    acre.cache.remove(typeloader.cache_key(type_id));
  });

  // uncached
  var result;
  typeloader._load.apply(null, type_ids)
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got _load result");
  type_ids.forEach(function(type_id) {
    var type_schema = result[type_id];
    ok(!typeloader.was_cached(type_schema), type_id + " should NOT have been cached");
    //assert_type_schema(type_schema, type_id);
  });

  // cached
  typeloader._load.apply(null, type_ids)
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got _load result");
  type_ids.forEach(function(type_id) {
    var type_schema = result[type_id];
    ok(typeloader.was_cached(type_schema), type_id + " should have been cached");
    //assert_type_schema(type_schema, type_id);
  });
});

test("load", function() {
  // test /film/performance./film/performance/film./film/film./film/film/initial_release_date./type/datetime

  acre.cache.remove(typeloader.cache_key("/film/performance"));

  function assert_film_performance_schema(schema) {
    var i,l;

    assert_key(schema, "/freebase/type_hints/mediator", true, "/film/performance is a mediator");

    var props = schema.properties;
    // assert /film/performance/film schema.properties[]
    var prop;
    for (i=0,l=props.length; i<l; i++) {
      if (props[i].id === "/film/performance/film") {
        prop = props[i];
        break;
      }
    }
    ok(prop, "Got /film/performance/film property");
    assert_key(prop, "unique", true, "/film/performance/film is unique");

    // assert /film/performance/film expected type
    var ect = prop.expected_type;
    assert_key(ect, "id", "/film/film");

    var subprops = ect.properties;
    ok(h.isArray(subprops), "Got subproperties");

    var subprop;
    for (i=0,l=subprops.length; i<l; i++) {
      if (subprops[i].id === "/film/film/initial_release_date") {
        subprop = subprops[i];
        break;
      }
    }
    ok(subprop, "Got /film/film/initial_release_date");
    assert_key(subprop, "unique", true, "/film/film/initial_release_date is unique");
    assert_key(subprop, "/freebase/property_hints/disambiguator", true, "/film/film/initial_release_date is disambiguator");

    ect = subprop.expected_type;
    assert_key(ect, "id", "/type/datetime");
    assert_key(ect, "/freebase/type_hints/mediator", false, "/type/datetime is NOT a mediator");
  };

  var result;
  typeloader.load("/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/film/performance"];
  ok(!typeloader.was_cached(schema), "/film/performance should NOT have been cached");
  assert_film_performance_schema(schema);

  // reload should get cached schema
  typeloader.load("/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  schema = result["/film/performance"];
  ok(typeloader.was_cached(schema), "/film/performance should have been cached");
  assert_film_performance_schema(schema);
});


acre.test.report();
