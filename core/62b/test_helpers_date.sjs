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

var h = acre.require("helpers_date");


test("parse_date", function() {
  var tests = [
    "August 3, 1998",
    "Aug 03, 98",
    "3 August 1998",
    "8/3/98",
    "08/03/1998"
  ];

  function assert_equals(d) {
    equals(d.getMonth(), 7);
    equals(d.getDate(), 3);
    equals(d.getFullYear(), 1998);
  }

  tests.forEach(function(test) {
    var d = h.parse_date(test);
    assert_equals(d);
  });

  var d = h.parse_date(tests[4], "MM/dd/yyyy");
  assert_equals(d);

  d = h.parse_date(tests[3], "MM/dd/yyyy");
  strictEqual(d, null);
});

test("format_date", function() {
  var tests = [
    ["MMMM d, yyyy", "August 3, 1998"],
    ["MMM dd, yy", "Aug 03, 98"],
    ["d MM yy", "3 08 98"],
    ["M/d/yy", "8/3/98"],
    ["MM/dd/yyyy", "08/03/1998"]
  ];
  var d = new Date(1998, 7, 3);

  tests.forEach(function([format, expected]) {
    equals(h.format_date(d, format), expected);
  });

  var [format, expected] = tests[4];
  ok(h.format_date(d));
});

test("relative_date", function() {
  var d = new Date();
  d.setTime(d.getTime() - 30 * 1000);
  equals(h.relative_date(d), "less than a minute ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 60 * 1000);
  equals(h.relative_date(d), "1 minute ago");

  d = new Date();
  d.setTime(d.getTime() - 3 * 60 * 1000);
  equals(h.relative_date(d), "3 minutes ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 hour ago");

  d = new Date();
  d.setTime(d.getTime() - 23 * 60 * 60 * 1000);
  equals(h.relative_date(d), "23 hours ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 day ago");

  d = new Date();
  d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "6 days ago");

  d = new Date();
  d.setTime(d.getTime() - 29 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "29 days ago");

  d = new Date();
  d.setTime(d.getTime() - 1 * 30 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 month ago");

  d = new Date();
  d.setTime(d.getTime() - 65 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "2 months ago");

  d = new Date();
  d.setTime(d.getTime() - 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 year ago");

  d = new Date();
  d.setTime(d.getTime() - 1.5 * 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "1 year ago");

  d = new Date();
  d.setTime(d.getTime() - 2.5 * 365 * 24 * 60 * 60 * 1000);
  equals(h.relative_date(d), "2 years ago");

  d = new Date();
  d.setTime(d.getTime() + 1 * 60 * 1000);
  equals(h.relative_date(d), "in the future???");
});

acre.test.report();


