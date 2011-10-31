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

acre.require("lib/test/mock").playback(this, "test/playback_test_create_type.json");

var schema_helpers = acre.require("helpers");
var test_helpers = acre.require("lib/test/helpers");
var freebase = acre.require("lib/promise/apis").freebase;
var create_type = acre.require("create_type").create_type;

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

function get_name() {
  return test_helpers.gen_test_name("test_create_type_");
};

test("create_type", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: key
      });
    })
    .then(function(r) {
      type = r;
    });
  acre.async.wait_on_results();
  ok(type, "type created");
  ok(type.id, "expected type id: " + type.id);
  ok(type.guid, "expected type guid:" + type.guid);
  equal(type.key.value, key);

  // check /common/topic included type and permission
  var check_result;
  freebase.mqlread({
    guid: type.guid,
    "/freebase/type_hints/included_types": {id:"/common/topic"},
    permission: {
      id: null,
      "!/type/object/permission": {id: user_domain}
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
});

test("create_type mediator", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: key,
        mediator: true
      });
    })
    .then(function(r) {
      type = r;
    });
  acre.async.wait_on_results();
  ok(type, "type created");

  var check_result;
  freebase.mqlread({
    guid: type.guid,
    "/freebase/type_hints/mediator": true,
    "/freebase/type_hints/enumeration": {
      value: true,
      optional: "forbidden"
    },
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
  ok(check_result["/freebase/type_hints/mediator"], "expected mediator");
  ok(!check_result["/freebase/type_hints/enumeration"],
    "did not expect enumeration");
  ok(!check_result["/freebase/type_hints/included_types"],
    "did not expect /common/topic as an included type");
});

test("create_type enumeration", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: key,
        enumeration: true
      });
    })
    .then(function(r) {
      type = r;
    });
  acre.async.wait_on_results();
  ok(type, "type created");

  var check_result;
  freebase.mqlread({
    guid: type.guid,
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
  ok(!check_result["/freebase/type_hints/mediator"],
    "did not expect mediator");
  ok(check_result["/freebase/type_hints/included_types"],
    "expected /common/topic as an included type");
});

test("create_type enumeration && mediator", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  var error;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: key,
        mediator: true,
        enumeration: true
      });
    })
    .then(function(r) {
      type = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!type, "expected error");
  ok(error, "expected error");
});

test("create_type no name", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  var error;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: "",
        key: key
      });
    })
    .then(function(r) {
      type = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!type, "expected error");
  ok(error, "expected error");
});

test("create_type no key", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  var error;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: ""
      });
    })
    .then(function(r) {
      type = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!type, "expected error");
  ok(error, "expected error");
});

test("create_type bad key", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  var error;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: "!@#$%^&*()_+"
      });
    })
    .then(function(r) {
      type = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!type, "expected error");
  ok(error, "expected error");
});

test("create_type no domain", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  var error;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        name: name,
        key: key
      });
    })
    .then(function(r) {
      type = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!type, "expected error");
  ok(error, "expected error");
});

test("create_type with description", function() {
  var name = get_name();
  var key = schema_helpers.generate_type_key(name);
  var type;
  test_helpers.delete_type2(key, user_domain)
    .then(function() {
      return create_type({
        domain: user_domain,
        name: name,
        key: key,
        description: name
      });
    })
    .then(function(r) {
      type = r;
    });
  acre.async.wait_on_results();
  ok(type, "type created");

  var check_result;
  freebase.mqlread({
    guid: type.guid,
    "/common/topic/article": {
      id: null,
      permission: {
        id: null,
        "!/type/object/permission": {
          id: user_domain
        }
      }
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
  equal(blurb, name);
});

acre.test.report();
