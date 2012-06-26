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

acre.require("test/mock").playback(this, "schema/test/playback_test_delete_type.json");

var test_helpers = acre.require("test/helpers.sjs");
var freebase = acre.require("promise/apis.sjs").freebase;
var delete_type = acre.require("schema/delete_type.sjs").delete_type;

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

  var info;
  delete_type(type.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    });
  acre.async.wait_on_results();
  ok(info, "got delete_type info");

  var check_result;
  freebase.mqlread({
    id: type.mid,
    type: {
      id: "/type/type",
      optional: "forbidden"
    },
    key: {
      namespace: type.key.namespace,
      value: type.key.value,
      optional: "forbidden"
    },
    "/type/type/domain": {
      id: type.domain.id,
      optional: "forbidden"
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
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

  var info, error;
  delete_type(type2.mid, user.id)
    .then(function(deleted) {
      info = deleted;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(error, "got delete_type error: " + error);
});

acre.test.report();
