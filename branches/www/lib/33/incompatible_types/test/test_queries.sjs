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

acre.require("test/mock").playback(this, "incompatible_types/test/playback_test_queries.json");

var q = acre.require("incompatible_types/queries");



test("incompatible_types /en/san_francisco and /people/person", function() {
  var result;
  q.incompatible_types("/en/san_francisco", "/people/person")
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result && result.length, "/en/san_francisco and /people/person are incompatible");
  ok(result.indexOf("/location/location") !== -1, "expected /location/location to be incompatible with /people/person");
});

test("incompatible_types /en/bob_dylan and /people/person", function() {
  var result;
  q.incompatible_types("/en/bob_dylan", "/people/person")
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result && !result.length, "/en/bob_dylan and /people/person are compatible");
});

test("incompatible_types /en/avatar_2009 and /tv/tv_program", function() {
  var result;
  q.incompatible_types("/en/bob_dylan", "/people/person")
    .then(function(r) {
      result = r;
    });
  acre.async.wait_on_results();
  ok(result && !result.length, "/en/avatar_2009 and /tv/tv_program are compatible");
});

acre.test.report();

