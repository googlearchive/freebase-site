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
var proploader = acre.require("schema/proploader.sjs");

function assert_key(obj, key, expected, msg) {
  ok(obj && key in obj &&
     (typeof expected === "boolean" ? !!obj[key] === expected : obj[key] === expected), msg);
};

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


acre.test.report();
