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
/**
 * In order to successfully RUN this test, you must be
 *
 * logged in on *freebase.com
 *
 * AND
 *
 * If on devel url
 *   1. have permission on /base OR
 *   2. have local write_user as appeditoruser with the auth secrect
 */
acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;

mf.require("test", "mox").playback(this, "playback_test_update_domain.json");

var schema_helpers = mf.require("helpers");
var test_helpers = mf.require("test", "helpers");
var freebase = mf.require("promise", "apis").freebase;
var update_domain = mf.require("update_domain").update_domain;

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

test("update_domain name", function() {
  var domain;
  test_helpers.create_domain2(user.id)
    .then(function(r) {
      domain = r;
    });
  acre.async.wait_on_results();
  ok(domain, "test domain created: " + domain.id);

  var result;
  update_domain({
    id: domain.mid,
    name: domain.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    id: domain.mid,
    name: null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, domain.name + "updated");
});

test("update_domain key", function() {
  var domain;
  test_helpers.create_domain2(user.id)
    .then(function(created) {
      domain = created;
    });
  acre.async.wait_on_results();
  ok(domain, "test domain created");

  var result;
  var new_key = domain.key.value + "updated";
  test_helpers.delete_domain2(new_key, user.id)
    .then(function() {
      return update_domain({
        id: domain.mid,
        namespace: user.id,
        key: new_key
      });
    })
    .then(function(id) {
      result = id;
    });
  acre.async.wait_on_results();
  ok(result, "Got update_domain result: " + result);

  var check_result;
  freebase.mqlread({
    id: domain.mid,
    key: {
      namespace: user.id,
      value: null
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  ok(check_result, "got check result");
  equal(check_result.key.value, domain.key.value + "updated");
});

test("update_domain description", function() {
  var domain;
  test_helpers.create_domain2(user.id)
    .then(function(created) {
      domain = created;
    });
  acre.async.wait_on_results();
  ok(domain, "test domain created");

  var result;
  update_domain({
    id: domain.mid,
    description: domain.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_domain result: " + result);

  var check_result;
  freebase.mqlread({
    mid: domain.mid,
    "/common/topic/article": {
      id: null
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  ok(check_result["/common/topic/article"], "got check result article: " + check_result["/common/topic/article"].id);

  var blurb;
  freebase.get_blob(check_result["/common/topic/article"].id, "blurb")
    .then(function(blob) {
      blurb = blob.body;
    });
  acre.async.wait_on_results();
  equal(blurb, domain.name + "updated");
});

acre.test.report();
