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

var h = acre.require("lib/helper/helpers.sjs");
var q = acre.require("queries.sjs");

acre.require("lib/test/mock").playback(this, "test/playback_test_queries.json");

function assert_authority_namespace(authorities, authority, namespace) {
  for (var i=0,l=authorities.length; i<l; i++) {
    var a = authorities[i];
    if (a.id === authority) {
      for (var j=0,k=a.ns.length; j<k; j++) {
        if (a.ns[j].id === namespace) {
          return true;
        }
      }
    }
  }
  return false;
};

function assert_key(keys, authority_id, ns_id, key, url) {
  for (var i=0,l=keys.length; i<l; i++) {
    var k = keys[i];
    if (k.authority &&
        k.authority.id === authority_id &&
        k.ns === ns_id &&
        k.key === key &&
        k.url == url) {
      return true;
    }
  }
  return false;
};

test("keys", function() {
  var keys;
  q.keys("/en/barack_obama")
    .then(function(r) {
      keys = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(keys) && keys.length, "Got keys");
  ok(assert_key(keys,
                "/en/wikipedia",
                "/wikipedia/en_id",
                "534366",
                "http://en.wikipedia.org/wiki/index.html?curid=534366"), "found wikipedia key");
  ok(assert_key(keys,
                "/en/facebook",
                "/authority/facebook",
                "barackobama",
                "http://www.facebook.com/barackobama"), "found facebook key");
});


test("key", function() {
  var key;
  q.key("/en/google", "/wikipedia/en_id", "1092923")
    .then(function(r) {
      return key = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(key) && key.length === 1, "Got /wikipedia/en/google");
  ok(assert_key(key, "/en/wikipedia", "/wikipedia/en_id", "1092923",
                "http://en.wikipedia.org/wiki/index.html?curid=1092923"),
     "found /wikipedia/en/google");
});


test("user_authority_namespaces", function() {
  var authorities;
  q.user_authority_namespaces("/user/daepark")
    .then(function(r) {
      authorities = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(authorities) && authorities.length, "Got authorities/namespaces");
  ok(assert_authority_namespace(authorities, "/en/facebook", "/authority/facebook"));
  ok(assert_authority_namespace(authorities, "/en/international_standard_book_number", "/authority/isbn"));
});

acre.test.report();
