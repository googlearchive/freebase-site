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

/**
 * A helper to test the correctness of a prop_structure
 * as returned by propbox/helpers.sjs:minimal_prop_structure
 */
function test_minimal_prop_structure(test, minimal, schema) {
  var i,l;
  // check required keys
  var keys = [
    "id", "string",
    "text", "string",
    "lang", "string",
    "disambiguator", "boolean",
    "display_none", "boolean",
    "deprecated", "boolean",
    "unique", "boolean",
    "expected_type", "object"
  ];
  for (i=0,l=keys.length; i<l; i+=2) {
    var key = keys[i];
    var val = minimal[key];
    test.ok(key in minimal, key);
    test.ok(val != null, key);
    test.same(typeof val, keys[i+1], key);
  }
  // check expected_type metadata
  var ect = schema.expected_type;
  keys = [
      "mediator", "enumeration", "included_types", 
      "never_assert", "deprecated"
  ];
  for (i=0,l=keys.length; i<l; i++) {
    var key = keys[i];
    var val1 = minimal.expected_type[key];
    var val2 = key in ect ? ect[key] : ect["/freebase/type_hints/" + key];
    if (typeof val1 === "boolean") {
      // convert null to false
      val2 = !!val2;
    }
    test.same(val1, val2, key);
  };
  // optional keys
  keys = ["unit", "master_property", "reverse_property"];
  for (i=0,l=keys.length; i<l; i++) {
    var key = keys[i];
    if (key in minimal) {
      test.ok(minimal[key] && schema[key]);
      test.equal(minimal[key].id, schema[key].id);
    }
  }
};
