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
    .playback(this, "schema/test/playback_test_typeloader.json");

var h = acre.require("helper/helpers.sjs");
var typeloader = acre.require("schema/typeloader.sjs");

function assert_key(obj, key, expected, msg) {
    if (obj && key in obj) {
        if (typeof expected === "boolean") {
            same(!!obj[key], expected, msg || expected);
        }
        else {
            same(obj[key], expected, msg || expected);
        }
    }
    else {
        ok(false, expected);
    }
};

function assert_dated_integer_schema(schema, deep) {
  var i,l;
  assert_key(schema, "/freebase/type_hints/mediator", true,
             "/measurement_unit/dated_integer is a mediator");  
  // assert /measurement_unit/dated_integer/year in schema.properties[]
  var props = h.map_array(schema.properties, "id");    
  var year = props["/measurement_unit/dated_integer/year"];
  ok(year, "Got /measurement_unit/dated_integer/year");
  assert_key(year, "unique", true, 
             "/measurement_unit/dated_integer/year is unique");
  // assert /measurement_unit/dated_integer/year expected type
  var ect = year.expected_type;
  assert_key(ect, "id", "/type/datetime");
  assert_key(ect, "/freebase/type_hints/mediator", false, 
             "/type/datetime is NOT a mediator");
  if (deep) {
    // assert /measurement_unit/dated_integer/source
    var source = props["/measurement_unit/dated_integer/source"];
    ok(source, "Got /measurement_unit/dated_integer/source");
    ect = source.expected_type;
    assert_key(ect, "id", "/dataworld/information_source");      
    var subprops = h.map_array(ect.properties, "id");
    var authority = subprops["/dataworld/information_source/authority"];
    ok(authority, "Got /dataworld/information_source/authority");
    assert_key(authority, "unique", false,
               "/dataworld/information_source/authority is NOT unique");
    assert_key(authority, "/freebase/property_hints/disambiguator", false, 
               "/dataworld/information_source/authority is NOT disambiguator");

    ect = authority.expected_type;
    assert_key(ect, "id", "/dataworld/provenance");
    assert_key(ect, "/freebase/type_hints/mediator", false, 
               "/dataworld/provenance is NOT a mediator");
  }
  else {
    ok(typeof ect.properties === "undefined", 
       "Should not contain deep properties");
  }
};

test("load", function() {
  var result;
  typeloader.load("/measurement_unit/dated_integer")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/measurement_unit/dated_integer"];
  ok(schema, "Got /measurement_unit/dated_integer");
  assert_dated_integer_schema(schema, false);
});

test("load deep", function() {
  var result;
  typeloader.load(true, "/measurement_unit/dated_integer")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result, "Got load result");
  var schema = result["/measurement_unit/dated_integer"];
  ok(schema, "Got /measurement_unit/dated_integer");
  assert_dated_integer_schema(schema, true);
});

acre.test.report();
