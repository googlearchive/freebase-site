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

acre.require("lib/test/mox").playback(this, "playback_test_queries_domain.json");

var ht = acre.require("helpers_test");
var q = acre.require("queries");
var mql = acre.require("mql");

test("domains", function() {
  var result;
  q.domains(mql.domains({"id":"/base/slamdunk",key:[]}))
    .then(function(domains) {
       result = domains;
    });
  acre.async.wait_on_results();
  ok(result, "got domain");
  ok(result.length === 1, "got /base/slamdunk domain");
  result = result[0];
  equal(result.id, "/base/slamdunk");
  ht.assert_domain_keys(result);
});

test("common_domains", function() {
  var result;
  q.common_domains()
    .then(function(domains) {
      result = domains;
    });
  acre.async.wait_on_results();
  ok(result && result.length, "got commons domains");
  result.forEach(function(domain) {
    ht.assert_domain_keys(domain);
  });
});

test("user_domains", function() {
  var result;
  q.user_domains("/user/daepark")
    .then(function(domains) {
      result = domains;
    });
  acre.async.wait_on_results();
  ok(result && result.length, "got user domains");
  var slamdunk_base;
  result.forEach(function(domain) {
    ht.assert_domain_keys(domain);
    if (domain.id === "/base/slamdunk") {
      slamdunk_base = domain;
    }
  });
  ok(slamdunk_base, "expected to find /base/slamdunk domain by /user/daepark");
});


test("domain", function() {
  function assert_type(type, mediator) {
    ht.assert_mql_keys(["name", "id", "properties"], type, true);
    ht.assert_bdb_keys(["instance_count"], type, true, "activity");
    ht.assert_article(["blurb"], type);
    if (mediator) {
      ok(type.mediator, "expected mediator type: " + type.id);
    }
  };

  var result;
  q.domain("/base/slamdunk")
    .then(function(d) {
      result = d;
    });
  acre.async.wait_on_results();
  ok(result);
  ht.assert_mql_keys(["id", "name", "creator",  "owners", "timestamp",
                      "types", "mediator:types"], result, true);
  ht.assert_article(["blurb", "blob"], result);

  // regular types
  ok(result.types && result.types.length);
  result.types.forEach(function(type) {
    assert_type(type);
  });
  // mediators
  var mediators = result["mediator:types"];
  if (mediators && mediators.length) {
    mediators.forEach(function(mediator) {
      assert_type(mediator, true);
    });
  }
});


acre.test.report();
