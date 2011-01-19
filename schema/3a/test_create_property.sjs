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

acre.require("lib/test/mox").playback(this, "playback_test_create_property.json");

var schema_helpers = acre.require("helpers");
var test_helpers = acre.require("lib/test/helpers");
var freebase = acre.require("lib/promise/apis").freebase;
var create_property = acre.require("create_property").create_property;

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
  return test_helpers.gen_test_name("test_create_property_");
};

test("create_property", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var prop;
  var name = get_name();
  var key = schema_helpers.generate_property_key(name);
  test_helpers.delete_property2(key, type.mid)
    .then(function() {
      return create_property({
        type: type.mid,
        name: name,
        key: key,
        expected_type: type.mid
      });
    })
    .then(function(r) {
      prop = r;
    });
  acre.async.wait_on_results();
  ok(prop, "got create_property result");

  var check_result;
  freebase.mqlread({
    guid: prop.guid,
    type: "/type/property",
    name: null,
    key: {value: null, limit:1},
    schema: null,
    unit: null,
    unique: null,
    expected_type: null,
    "/freebase/documented_object/tip": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, name);
  equal(check_result.key.value, key);
  equal(check_result.schema, type.id);
  ok(!check_result.unit);
  ok(!check_result.unique);
  equal(check_result.expected_type, type.id);
  ok(!check_result["/freebase/documented_object/tip"]);
  ok(!check_result["/freebase/property_hints/disambiguator"]);
  ok(!check_result["/freebase/property_hints/display_none"]);
});


test("create_property options", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var prop;
  var name = get_name();
  var key = schema_helpers.generate_property_key(name);
  test_helpers.delete_property2(key, type.id)
    .then(function() {
      return create_property({
        type: type.mid,
        name: name,
        key: key,
        expected_type: type.mid,
        unit: "/en/meter",
        unique: true,
        disambiguator: true,
        hidden: true,
        description: name
      });
    })
    .then(function(r) {
      prop = r;
    });
  acre.async.wait_on_results();
  ok(prop, "got create_property result");

  var check_result;
  freebase.mqlread({
    guid: prop.guid,
    type: "/type/property",
    name: null,
    key: {value: null, limit:1},
    schema: null,
    unit: null,
    unique: null,
    expected_type: null,
    "/freebase/documented_object/tip": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, name);
  equal(check_result.key.value, key);
  equal(check_result.schema, type.id);
  equal(check_result.unit, "/en/meter");
  ok(check_result.unique);
  equal(check_result.expected_type, type.id);
  equal(check_result["/freebase/documented_object/tip"], name);
  ok(check_result["/freebase/property_hints/disambiguator"]);
  ok(check_result["/freebase/property_hints/display_none"]);
});


test("create_property enumeration in namespace", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var namespace;
  var ns_key = test_helpers.gen_test_name("test_namespace_");
  freebase.mqlwrite({
    id: null,
    mid: null,
    type: "/type/namespace",
    key: {
      namespace: type.mid,
      value: ns_key
    },
    create: "unless_exists"
  })
  .then(function(env) {
    namespace = env.result;
  });
  acre.async.wait_on_results();
  ok(namespace, "test namespace created");

  var prop;
  var name = get_name();
  var key = schema_helpers.generate_property_key(name);
  test_helpers.delete_property2(key, type.id)
    .then(function() {
      return create_property({
        type: type.mid,
        name: name,
        key: key,
        expected_type: "/type/enumeration",
        enumeration: namespace.mid,
        unit: "/en/meter",   // unit should be ignored
        unique: true,        // unique should be ignored
        disambiguator: true,
        hidden: true,
        description: name
      });
    })
    .then(function(r) {
      prop = r;
    });
  acre.async.wait_on_results();
  ok(prop, "got create_property result");

  var check_result;
  freebase.mqlread({
    guid: prop.guid,
    type: "/type/property",
    name: null,
    key: {value: null, limit:1},
    schema: null,
    unit: null,
    unique: null,
    expected_type: null,
    enumeration: null,
    "/freebase/documented_object/tip": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, name);
  equal(check_result.key.value, key);
  equal(check_result.schema, type.id);
  ok(!check_result.unit);
  ok(!check_result.unique);
  equal(check_result.expected_type, "/type/enumeration");
  equal(check_result["/freebase/documented_object/tip"], name);
  ok(check_result["/freebase/property_hints/disambiguator"]);
  ok(check_result["/freebase/property_hints/display_none"]);
});

test("create_property enumeration in non-namespace", function() {
  var type;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");

  var prop, error;
  var name = get_name();
  var key = schema_helpers.generate_property_key(name);
  test_helpers.delete_property2(key, type.id)
    .then(function() {
      return create_property({
        type: type.mid,
        name: name,
        key: key,
        expected_type: "/type/enumeration",
        enumeration: type.mid
      });
    })
    .then(function(r) {
      prop = r;
    }, function(e) {
      error = e;
    });
  acre.async.wait_on_results();
  ok(!prop, "expected error");
  ok(error, "expected error: " + error);
});

acre.test.report();
