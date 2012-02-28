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
var q = acre.require("queries/user.sjs");

acre.require("test/mock").playback(this, "queries/test/playback_test_user_queries.json");

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

test("authority_namespaces", function() {
  var authorities;
  q.authority_namespaces("/user/daepark")
    .then(function(r) {
      authorities = r;
    });
  acre.async.wait_on_results();
  ok(h.isArray(authorities) && authorities.length, "Got authorities/namespaces");
  ok(assert_authority_namespace(authorities, "/en/facebook", "/authority/facebook"));
  ok(assert_authority_namespace(authorities, "/en/international_standard_book_number", "/authority/isbn"));
});

acre.test.report();

