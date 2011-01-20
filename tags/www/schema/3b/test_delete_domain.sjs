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

acre.require("lib/test/mox").playback(this, "playback_test_delete_domain.json");

var freebase = acre.require("lib/promise/apis").freebase;
var test_helpers = acre.require("lib/test/helpers");
var delete_domain = acre.require("delete_domain").delete_domain;

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

var user_domain = user.id + "/default_domain";

test("delete_domain no permission", function() {
  var result, error;
  delete_domain("/base/slamdunk", "/user/tfmorris", true)
    .then(function(info) {
      result = info;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!result, "expected error");
  ok(error, "expected error: " + error);
});

test("delete_domain user default_domain", function() {
  var result, error;
  delete_domain(user_domain, user.id, true)
    .then(function(info) {
      result = info;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!result, "expected error");
  ok(error, "expected error: " + error);
});

test("delete_domain commons domain", function() {
  var result, error;
  delete_domain("/freebase", user.id, true)
    .then(function(info) {
      result = info;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!result, "expected error");
  ok(error, "expected error: " + error);
});

function assert_deleted_result(result, domain) {
  ok(result && result.length === 3);
  var domain_info = result[0];
  var deleted_base_key = result[1];
  var deleted_domain = result[2];

  ok(domain_info && deleted_base_key && deleted_domain);

  equal(deleted_domain.type.connect, "deleted", "/type/domain deleted");
  var is_type_domain = acre.freebase.mqlread({guid:domain.guid, type:"/type/domain"}).result;
  ok(!is_type_domain, "/type/domain delete confirmed");

  if (deleted_domain.key) {
    equal(deleted_domain.key.length, 1);
    equal(deleted_domain.key[0].value, domain.key.value);
    equal(deleted_domain.key[0].namespace, domain.key.namespace);
    equal(deleted_domain.key[0].connect, "deleted", "key deleted");
    var has_key = acre.freebase.mqlread({id:domain.guid, key:{value:domain.key.value, namespace:user.id}}).result;
    ok(!has_key, "key delete confirmed");
  }

  // check "/dataworld/gardening_task/async_delete"
  ok(deleted_domain["/dataworld/gardening_task/async_delete"].value === true &&
     deleted_domain["/dataworld/gardening_task/async_delete"].connect === "inserted",
     "/dataworld/gardening_task/async_delete set");

  return result;
};

test("delete_domain user domain", function() {
  var domain;
  test_helpers.create_domain2(user.id)
    .then(function(created) {
      domain = created;
    });
  acre.async.wait_on_results();
  ok(domain, "test domain created");

  var result;
  delete_domain(domain.mid, user.id)
    .then(function(deleted_info) {
      result = deleted_info;
    });
  acre.async.wait_on_results();
  ok(result, "got delete_domain_result");
  var [domain_info, deleted_base_key, deleted_domain] = assert_deleted_result(result, domain);

  // no base keys
  ok(!deleted_base_key.length);
});

test("delete domain base domain", function() {
  var name = test_helpers.gen_test_name("test_base_");
  var key = name.toLowerCase();
  // create test base
  var domain;
  freebase.mqlread({
    guid: null,
    key: {namespace: "/base", value: key}
  })
  .then(function(env) {
    if (env.result) {
      return freebase.mqlwrite({
        guid: env.result.guid,
        key: {namespace: "/base", value: key, connect:"delete"},
        type: {id: "/type/domain", connect:"delete"}
      }, null, {http_sign:false});
    }
  })
  .then(function() {
    return freebase.mqlwrite({
      id: null,
      guid: null,
      mid: null,
      name: name,
      key: {value:key, namespace:"/base"},
      type: {id: "/type/domain"},
      create: "unconditional"
    }, null, {http_sign:false})
    .then(function(env) {
      domain = env.result;
    });
  });
  acre.async.wait_on_results();
  ok(domain, "test domain created");

  var result;
  delete_domain(domain.mid, user.id)
    .then(function(deleted_info) {
      result = deleted_info;
    });
  acre.async.wait_on_results();
  ok(result, "got delete_domain_result");
  var [domain_info, deleted_base_key, deleted_domain] = assert_deleted_result(result, domain);

  // assert /base key is deleted
  equal(deleted_base_key.key.length, 1);
  equal(deleted_base_key.key[0].value, domain.key.value);
  equal(deleted_base_key.key[0].namespace, "/base");
  equal(deleted_base_key.key[0].connect, "deleted", "key deleted");
  var has_key = acre.freebase.mqlread({id:domain.guid, key:{value:domain.key.value, namespace:"/base"}}).result;
  ok(!has_key, "key delete confirmed");
});

acre.test.report();
