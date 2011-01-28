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

acre.require("lib/test/mock").playback(this, "playback_test_update_type.json");

var schema_helpers = acre.require("helpers");
var test_helpers = acre.require("lib/test/helpers");
var freebase = acre.require("lib/promise/apis").freebase;
var update_type = acre.require("update_type").update_type;

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

test("update_type name", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  update_type({
    domain: user_domain,
    id: type.mid,
    name: type.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    id: type.mid,
    name: null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, type.name + "updated");
});

test("update_type key", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  var new_key = type.key.value + "updated";
  test_helpers.delete_type2(new_key, user_domain)
    .then(function() {
      return update_type({
        domain: user_domain,
        id: type.mid,
        key: new_key
      });
    })
    .then(function(id) {
      result = id;
    });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    id: type.mid,
    key: {
      namespace: user_domain,
      value: null
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  ok(check_result, "got check result");
  equal(check_result.key.value, type.key.value + "updated");
});

test("update_type enumeration", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  update_type({
    domain: user_domain,
    id: type.mid,
    enumeration: true
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    id: type.mid,
    "/freebase/type_hints/enumeration": true,
    "/freebase/type_hints/mediator": {
      value: true,
      optional: "forbidden"
    },
    "/freebase/type_hints/included_types": {
      id: "/common/topic"
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  ok(check_result["/freebase/type_hints/enumeration"], "expected enumeration");
  ok(!check_result["/freebase/type_hints/mediator"], "did not expect mediator");
});

test("update_type mediator", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  update_type({
    domain: user_domain,
    id: type.mid,
    mediator: true
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    id: type.mid,
    "/freebase/type_hints/enumeration": {
      value: true,
      optional: "forbidden"
    },
    "/freebase/type_hints/mediator": true,
    "/freebase/type_hints/included_types": {
      id: "/common/topic",
      optional: "forbidden"
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  ok(!check_result["/freebase/type_hints/enumeration"], "did not expect enumeration");
  ok(check_result["/freebase/type_hints/mediator"], "expected mediator");
});

test("update_type enumeration && mediator", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result, error;
  update_type({
    domain: user_domain,
    id: type.mid,
    enumeration: true,
    mediator: true
  })
  .then(function(id) {
    result = id;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(!result, "Expected error");
  ok(error, "Expected error: " + error);
});

test("update_type description", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var result;
  update_type({
    domain: user_domain,
    id: type.mid,
    description: type.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "Got update_type result: " + result);

  var check_result;
  freebase.mqlread({
    mid: type.mid,
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
  equal(blurb, type.name + "updated");
});

acre.test.report();
