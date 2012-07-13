/*
 * Copyright 2012, Google Inc.
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

acre.require("test/mock")
    .playback(this, "queries/test/playback_test_update_article.json");

var create_article = acre.require("queries/create_article.sjs").create_article;
var update_article = acre.require("queries/update_article.sjs").update_article;
var freebase = acre.require("promise/apis").freebase;

// this test requires user to be logged in
var user;
test("login required", function() {
  freebase.get_user_info()
    .then(function(user_info) {
      user = user_info;
    });
  acre.async.wait_on_results();
  ok(user, "login required");
});
if (!user) {
  acre.test.report();
  acre.exit();
}

function check_blurb(document_id, expected_blurb) {
  // check blob
  var blurb;
  freebase.get_blob(document_id, "plain")
    .then(function(blob) {
      blurb = blob.body;
    });
  acre.async.wait_on_results();
  equal(blurb, expected_blurb);
}

test("update_article", function() {
  var topic;
  var content = "test_update_article";
  var content_update = "text_update_article_updated";
  freebase.mqlwrite({
    id: null,
    create: "unconditional"
  })
  .then(function(env) {
    topic = env.result;
  });
  acre.async.wait_on_results();
  ok(topic, "created topic");

  var document;
  create_article(topic.id, content, "text/plain")
    .then(function(r) {
      document = r.document;
    });
  acre.async.wait_on_results();
  ok(document, "got create_article result");

  check_blurb(document, content);

  var result;
  update_article(document, content_update, "text/plain")
      .then(function(r) {
          result = r;
      });
  acre.async.wait_on_results();
  
  // Can't check updated blurb because http://b/issue?id=5857599
  // 
  // check_blurb(document, content_update);
  // 
  // for now just check the content length
  same(result.length, content_update.length);
});

acre.test.report();
