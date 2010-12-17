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

var mf = acre.require("MANIFEST").mf;
var h = mf.require("helpers");

var tests = [
  ["foo", "/bar/baz", {id:"hello"}],
  {s:"foo", p:"/bar/baz", o:{id:"hello"}, mql:{id:"foo", "/bar/baz":{id:"hello"}}},

  ["foo", "/bar/baz", {value:"hello"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello"}, mql:{id:"foo", "/bar/baz":{value:"hello"}}},

  ["foo", "/bar/baz", {value:"hello", lang:"/lang/ko"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", lang:"/lang/ko"}, mql:{id:"foo", "/bar/baz":{value:"hello", lang:"/lang/ko"}}},

  ["foo", "/bar/baz", {value:"hello", namespace:"/"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", namespace:"/"}, mql:{id:"foo", "/bar/baz":{value:"hello", namespace:"/"}}},

  ["foo", "/bar/baz", null, "/", "hello"],
  {s:"foo", p:"/bar/baz", o:{value:"hello", namespace:"/"}, mql:{id:"foo", "/bar/baz":{value:"hello", namespace:"/"}}},

  ["foo", "/bar/baz", {value:"hello", link:{target_value:{valud:"hello", lang:"/lang/ko"}}}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", lang:"/lang/ko"}, mql:{id:"foo", "/bar/baz":{value:"hello", lang:"/lang/ko"}}}
];

test("triple", tests, function() {
  for(var i=0,l=tests.length; i<l; i+=2) {
    var triple = h.triple.apply(null, tests[i]);
    triple.mql = JSON.parse(triple.mql);
    deepEqual(triple, tests[i+1]);
  }
});

tests = [
  0, "<10",
  5, "<10",
  10, "10+",
  19, "10+",
  45, "40+",
  100, "100+",
  150, "100+",
  1000, "1k",
  1500, "1.5k",
  9149, "9.1k",
  9150, "9.2k",
  9999, "10k",
  10000, "10k",
  10001, "10k",
  10101, "10k",
  14999, "15k",
  19499, "19k",
  99999, "100k",
  999999, "1,000k"
];

test("format_number", tests, function() {
  for(var i=0,l=tests.length; i<l; i+=2) {
    equal(h.format_number(tests[i]), tests[i+1]);
  }
});

test("is_valid", function() {
  equal(h.is_valid({}), true, "valid");
  equal(h.is_valid({valid:false}), false, "invalid");
  equal(h.is_valid({valid:true}), true, "valid");
});

test("valid_class", function() {
  equal(h.valid_class({}), "valid");
  equal(h.valid_class({valid:false}), "invalid");
  equal(h.valid_class({valid:true}), "valid");
});

test("link_class", function() {
  equal(h.link_class({}), "valid");
  equal(h.link_class({valid:false, operation:"foo"}), "invalid foo");
  equal(h.link_class({valid:true, operation:"update"}), "valid update");
});


acre.test.report();
