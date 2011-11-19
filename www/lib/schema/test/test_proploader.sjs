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

acre.require("test/mock").playback(this, "schema/test/playback_test_proploader.json");

var h = acre.require("helper/helpers.sjs");
var proploader = acre.require("schema/proploader.sjs");

test("is_prop_id", function() {
  var valid = ["/a/b/c", "/a/b/c/d", "/a/b/c/d/e"];
  valid.forEach(function(id) {
    ok(proploader.is_prop_id(id), "valid:" + id);
  });
  var invalid = ["/a/b", "/a", "/", ""];
  invalid.forEach(function(id) {
    ok(!proploader.is_prop_id(id), "invalid: " + id);
  });
});

test("get_type_id", function() {
  same(proploader.get_type_id("/a/b/c"), "/a/b");
  var invalid = ["/a/b", "/a", "/", ""];
  invalid.forEach(function(id) {
    try {
      proploader.get_type_id(id);
      ok(false, "Expected invalid property id: " + id);
    }
    catch (ex) {
      ok(true, ""+ex);
    }
  });
});

test("load", function() {
  var result;
  var pid = "/film/performance/film";
  proploader.load(pid)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result[pid];
  ok(schema, "Got property schema");
  ok(schema.expected_type && schema.expected_type.properties && schema.expected_type.properties.length,
     "Got disambiguating properties");
  schema.expected_type.properties.forEach(function(prop) {
    ok(prop["/freebase/property_hints/disambiguator"] == true, "Expected only disambiguators");
  });
});

test("load all", function() {
  var result;
  var pid = "/film/performance/film";
  proploader.load(true, pid)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result[pid];
  ok(schema, "Got property schema");
  ok(schema.expected_type && schema.expected_type.properties && schema.expected_type.properties.length,
     "Got deep properties");
  // just look for some none disambiguating properties
  var props = schema.expected_type.properties.filter(function(prop) {
    return prop["/freebase/property_hints/disambiguator"] != true;
  });
  ok(props.length, "Got all deep properties");
});

test("load multi", function() {
  var result;
  var pids = ["/film/film/initial_release_date", "/film/film/directed_by"];
  proploader.load.apply(null, pids)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  pids.forEach(function(pid) {
    ok(result[pid], "Got property schema: " + pid);
  });
});

acre.test.report();
