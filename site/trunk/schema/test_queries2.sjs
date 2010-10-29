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
var q = mf.require("queries");
var mql = mf.require("mql");


test("incoming_from_domain", function() {
  var result;
  q.incoming_from_domain("/film/film", "/film")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids start with /film/
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/film/") !== 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_domain count", function() {
  var result;
  q.incoming_from_domain("/film/film", "/film", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

test("incoming_from_commons", function() {
  var result;
  q.incoming_from_commons("/film/film", "/film")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids are NOT /film/... since we're excluding it
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/film/") === 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_commons count", function() {
  var result;
  q.incoming_from_commons("/film/film", "/film", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

test("incoming_from_bases", function() {
  var result;
  q.incoming_from_bases("/base/truereligion/jeans", "/base/truereligion")
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(result && (result instanceof Array));

  // check all prop ids are NOT /base/truereligion/... since we're excluding it
  var errors = [];
  result.forEach(function(p) {
    if (p.id.indexOf("/base/truereligion/") === 0) {
      errors.push(p.id);
    }
  });
  ok(!errors.length, errors.join(","));
});

test("incoming_from_bases count", function() {
  var result;
  q.incoming_from_commons("/base/slamdunk/player", "/base/slamdunk", true)
    .then(function(props) {
      result = props;
    });
  acre.async.wait_on_results();
  ok(typeof result === "number", ""+result);
});

acre.test.report();

