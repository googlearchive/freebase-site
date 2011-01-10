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

acre.require("test/mox").playback(this, "playback_test_create_article.json");

var lib = acre.require("queries/create_article");
var create_article = lib.create_article;
var upload = lib.upload;
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
  freebase.get_blob(document_id, "blurb")
    .then(function(blob) {
      blurb = blob.body;
    });
  acre.async.wait_on_results();
  equal(blurb, expected_blurb);
};

test("upload", function() {
  var result;
  var content = "test_upload";
  upload(content, "text/html")
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result, "got upload result");

  check_blurb(result.id, content);
});

test("upload with document", function() {

  var article;
  freebase.mqlwrite({id:null, type:"/common/document", create:"unconditional"})
    .then(function(env) {
      article = env.result;
    });
  acre.async.wait_on_results();
  ok(article, "created article");

  var result;
  var content = "test_upload with document";
  upload(content, "text/html", {document: article.id})
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result, "got upload result");

  check_blurb(article.id, content);
});

test("upload with lang", function() {
  var result;
  var content = "test_upload with lang";
  upload(content, "text/html", {lang: "/lang/ko"})
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result, "got upload result");

  // check lang
  var lang;
  freebase.mqlread({id:result.id, "/type/content/language": null})
    .then(function(env) {
      lang = env.result && env.result["/type/content/language"] || null;
    });
  acre.async.wait_on_results();
  equal(lang, "/lang/ko");
});

test("create_article", function() {
  var result;
  var content = "test_create_article";
  create_article(content, "text/html")
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result, "got create_article result");

  // check blob
  check_blurb(result.id, content);
});

test("create_article with permission", function() {
  var result;
  var content = "test_create_article with permission";
  create_article(content, "text/html", {use_permission_of: user.id + "/default_domain"})
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result, "got create_article result");

  // check permission
  var q = {
    id: result.id,
    permission: {
      id: null,
      "!/type/object/permission": {
        id: user.id + "/default_domain"
      }
    }
  };
  var permission;
  freebase.mqlread(q)
    .then(function(env) {
      var r = env.result;
      if (r && r.permission && r.permission["!/type/object/permission"]) {
        permission = r.permission["!/type/object/permission"].id;
      }
    });
  acre.async.wait_on_results();
  ok(permission, "got proper permission");
});

test("create_article with topic", function() {
  var result, topic;
  var content = "test_create_article with topic";
  freebase.mqlwrite({
    id: null,
    create: "unconditional"
  })
  .then(function(env) {
    topic = env.result;
  });
  acre.async.wait_on_results();
  ok(topic, "created topic");

  create_article(content, "text/html", {topic:topic.id})
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result, "got create_article result");

  var check_result;
  freebase.mqlread({
    id: topic.id,
    "/common/topic/article": {
      id: result.id
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
});

acre.test.report();
