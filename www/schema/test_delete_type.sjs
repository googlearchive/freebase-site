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

acre.require("lib/test/mox").playback(this, "playback_test_delete_type.json");

var test_helpers = acre.require("lib/test/helpers");
var freebase = acre.require("lib/promise/apis").freebase;
var delete_type = acre.require("delete_type").delete_type;
var undo = acre.require("delete_type").undo;

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

test("delete_type", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var info, result;
  delete_type(type.mid, user.id)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_type info");
  ok(result, "got delete_type result");

  ok(result.type.id === "/type/type" &&
     result.type.connect === "deleted", "type link deleted: " + type.id);

  ok(result.key[0].value === type.key.value &&
     result.key[0].namespace === type.key.namespace &&
     result.key[0].connect === "deleted", "key deleted: " + type.key.value);

  ok(result.domain.id === type.domain.id &&
     result.domain.connect === "deleted", "domain link deleted: " + type.domain.id);

  ok(result["/dataworld/gardening_task/async_delete"].value === true &&
     result["/dataworld/gardening_task/async_delete"].connect === "inserted",
     "/dataworld/gardening_task/async_delete set");
});

test("delete_type dry_run", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var info, result;
  delete_type(type.mid, user.id)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_type info");
  ok(result, "got delete_type result");

  equal(info.guid, type.guid, "type info.guid: " + info.guid);
  ok(info.key[0].value === type.key.value &&
     info.key[0].namespace === type.key.namespace, "type info.key: " + type.key.value);

  ok(info.domain.id === type.domain.id, "type info.domain: " + type.domain.id);
});

test("undo", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var info, result;
  delete_type(type.mid, user.id)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_type info");
  ok(result, "got delete_type result");


  // assert deleted
  ok(result.type.id === "/type/type" && result.type.connect === "deleted", "/type/type deleted");

  // undo
  var undo_info, undo_result;
  undo(info)
    .then(function([i, r]) {
      undo_info = i;
      undo_result = r;
    });
  acre.async.wait_on_results();
  ok(undo_info, "get undo info");
  ok(undo_result, "got undo result");

  ok(undo_result.type.id === "/type/type" && undo_result.type.connect === "inserted", "/type/type inserted");

  ok(undo_result["/dataworld/gardening_task/async_delete"].value === true &&
     undo_result["/dataworld/gardening_task/async_delete"].connect === "deleted",
     "/dataworld/gardening_task/async_delete unset");
});

test("delete_type expected_by property", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var type2;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");

  var prop;
  test_helpers.create_property2(type.mid, {"/type/property/expected_type": {id: type2.mid}})
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test property created");

  var info, result;
  delete_type(type2.mid, user.id, false, true)
    .then(function([i, r]) {
      info = i;
      result = r;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_type info");
  ok(result, "got delete_type result");

  // prop.expected_type should have been deleted since user has permission on it
  var check_ect;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/expected_type": {
      id: null,
      optional: "forbidden"
    }
  })
  .then(function(env) {
    check_ect = env.result;
  });
  acre.async.wait_on_results();
  ok(!check_ect, "did not expect ect");

  // undo
  undo(info);
  acre.async.wait_on_results();

  var check_undo;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/expected_type": {
      id:type2.mid
    }
  })
  .then(function(env) {
    check_undo = env.result;
  });
  acre.async.wait_on_results();
  ok(check_undo, "got check undo result");
});

acre.test.report();
