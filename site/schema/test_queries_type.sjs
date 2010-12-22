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

mf.require("test", "mox").playback(this, "playback_test_queries_type.json");

var ht = mf.require("helpers_test");
var q = mf.require("queries");

test("base_type", function() {
  var result;
  q.base_type("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  ht.assert_type(result);
});

test("type", function() {
  var result;
  q.type("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  ht.assert_type(result);
  ok(result.incoming);
  ht.assert_keys(["domain", "commons", "bases"], result.incoming);
});

test("typediagram", function() {
  var result;
  q.typediagram("/base/slamdunk/player")
    .then(function(t) {
      result = t;
    });
  acre.async.wait_on_results();
  ok(result);
  ht.assert_type(result);
  ok(result.incoming);
  ht.assert_keys(["domain", "commons", "bases"], result.incoming);
});


test("type_role", function() {
  var result;
  q.type_role("/film/performance")
    .then(function(role) {
      result = role;
    });
  acre.async.wait_on_results();
  ok(result.mediator, "expected /film/performance to be a mediator");

  q.type_role("/people/gender")
    .then(function(role) {
      result = role;
    });
  acre.async.wait_on_results();
  ok(result.enumeration, "expected /people/gender to be an enumeration");
});


acre.test.report();
