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
var fh = acre.require("filter/helpers.sjs");

test("global_filters", function() {
  var filters = {
    domain: "domain",
    lang: "/lang/ko",
    as_of_time: null,
    foo: "bar"
  };
  same(fh.global_filters(filters), {domain:"domain", lang:"/lang/ko"});
  same(fh.global_filters(), {});
  same(fh.global_filters(null), {});
  same(fh.global_filters({}), {});
  same(fh.global_filters({
    domain: null,
    type: null,
    property: null,
    lang: null,
    as_of_time: null
  }), {});
});

test("add_filter", function() {
  var filters = {
    limit: "500",
    timestamp: "today",
    as_of_time: "2010",
    history: "1",
    property: "/type/object/name"
  };
  var params = fh.add_filter(filters, "timestamp", "yesterday");
  same(params, h.extend({}, filters, {timestamp: "yesterday"}));

  params = fh.add_filter(filters, "hello", "world");
  same(params, h.extend({}, filters, {hello: "world"}));
});

test("remove_filter", function() {
  var filters = {
    limit: "500",
    timestamp: "today",
    as_of_time: "2010",
    history: "1",
    property: "/type/object/name"
  };
  var params = fh.remove_filter(filters, "timestamp");
  delete filters.timestamp;
  same(params, filters);
});

var tests = [
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
    equal(fh.format_number(tests[i]), tests[i+1]);
  }
});

acre.test.report();
