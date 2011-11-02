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
  });
});

test("load", function() {
  acre.cache.remove(typeloader.cache_key("/film/performance"));

  var result;
  typeloader.load("/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/film/performance"];
  ok(schema, "Got /film/performance type schema");
  ok(!typeloader.was_cached(schema), "/film/performance should NOT have been cached");
  assert_film_performance_schema(schema, false);

  // reload should get cached schema
  typeloader.load("/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  schema = result["/film/performance"];
  ok(schema, "Got /film/performance type schema");
  ok(typeloader.was_cached(schema), "/film/performance should have been cached");
  assert_film_performance_schema(schema, false);
});

test("load deep", function() {
  acre.cache.remove(typeloader.cache_key("/film/performance"));

  var result;
  typeloader.load(true, "/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/film/performance"];
  ok(schema, "Got /film/performance type schema");
  ok(!typeloader.was_cached(schema), "/film/performance should NOT have been cached");
  assert_film_performance_schema(schema, true);

  // reload should get cached schema
  typeloader.load(true, "/film/performance")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  schema = result["/film/performance"];
  ok(schema, "Got /film/performance type schema");
  ok(typeloader.was_cached(schema), "/film/performance should have been cached");
  assert_film_performance_schema(schema, true);
});

test("unload", function() {
  // remove from cache
  var type_ids = ["/common/topic", "/type/text", "/common/document", "/common/image"];

  // warm up the cache
  var result;
  typeloader.load.apply(null, type_ids)
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  typeloader.load.apply(null, type_ids)
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  type_ids.forEach(function(type_id) {
    var type_schema = result[type_id];
    ok(typeloader.was_cached(type_schema), type_id + " should have been cached");
  });

  // invalidate
  typeloader.unload.apply(null, type_ids);

  // type_ids should NOT be cahced
  typeloader.load.apply(null, type_ids)
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  type_ids.forEach(function(type_id) {
    var type_schema = result[type_id];
    ok(!typeloader.was_cached(type_schema), type_id + " should NOT have been cached");
  });
});

function assert_film_performance_schema(schema, deep) {
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
  assert_key(ect, "/freebase/type_hints/mediator", false, "/film/film is NOT a mediator");

  if (deep) {
    var subprops = ect.properties;
    ok(h.isArray(subprops), "Got deep properties");

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
  }
  else {
    ok(typeof ect.properties === "undefined", "Should not contain deep properties");
  }
};

acre.test.report();
