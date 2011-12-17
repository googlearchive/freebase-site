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

// we want acre.cache to be on since we're testing the load/unload from the cache
//acre.require("test/mock").playback(this, "schema/test/playback_test_typeloader_caching.json", true);
test("skip", function() {
  ok("Skip tests because of PermGen");
});

var typeloader = acre.require("schema/typeloader.sjs");

test("_load", {bug:"PermGen"}, function() {
  // remove from cache
  // These are "terminal" types that don't have any properties, thus no expected_types
  var type_ids = ["/people/gender", "/type/rawstring"];
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


test("load", {bug:"PermGen"}, function() {
  // remove from cache
  // /measurement_unit/integer_range has 2 properties that both have expected_type, /type/int
  var type_ids = ["/measurement_unit/integer_range", "/type/int"];
  type_ids.forEach(function(type_id) {
    acre.cache.remove(typeloader.cache_key(type_id));
  });

  var result;
  typeloader.load("/measurement_unit/integer_range")
    .then(function(r) {
      result = r;
    });
  ok(result, "Got load result");
  var schema = result["/measurement_unit/integer_range"];
  ok(schema, "Got /measurement_unit/integer_range type schema");
  ok(!typeloader.was_cached(schema), "/measurement_unit/integer_range should NOT have been cached");

  result = null;
  typeloader.load("/measurement_unit/integer_range")
    .then(function(r) {
      result = r;
    });
  ok(result, "Got load result");
  schema = result["/measurement_unit/integer_range"];
  ok(schema, "Got /measurement_unit/integer_range type schema");
  ok(typeloader.was_cached(schema), "/measurement_unit/integer_range should have been cached");
  schema.properties.forEach(function(p) {
    ok(typeloader.was_cached(p.expected_type), p.id + " expected_type " + p.expected_type.id + " should have been cached");
  });
});


test("unload", {bug:"PermGen"}, function() {
  // remove from cache
  // /measurement_unit/integer_range has 2 properties that both have expected_type, /type/int
  var type_ids = ["/measurement_unit/integer_range", "/type/int"];
  type_ids.forEach(function(type_id) {
    acre.cache.remove(typeloader.cache_key(type_id));
  });

  // warm up the cache
  var result;
  typeloader.load("/measurement_unit/integer_range")
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();

  // invalidate
  typeloader.unload("/measurement_unit/integer_range");

  // /measurement_unit/integer_range should NOT be cached, but it's properties' expected_type /type/int should be cached
  typeloader.load("/measurement_unit/integer_range")
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/measurement_unit/integer_range"];
  ok(schema, "Got /measurement_unit/integer_range type schema");
  ok(!typeloader.was_cached(schema), "/measurement_unit/integer_range should have been cached");
  schema.properties.forEach(function(p) {
    ok(typeloader.was_cached(p.expected_type), p.id + " expected_type " + p.expected_type.id + " should have been cached");
  });

});

acre.test.report();
