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

test("keys", function() {

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


acre.test.report();
