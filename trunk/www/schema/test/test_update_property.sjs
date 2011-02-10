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

acre.require("lib/test/mock").playback(this, "test/playback_test_update_property.json");

var freebase = acre.require("lib/promise/apis").freebase;
var schema_helpers = acre.require("helpers");
var test_helpers = acre.require("lib/test/helpers");
var update_property = acre.require("update_property").update_property;

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

test("update_property name", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result;
  update_property({
    type: type.mid,
    id: prop.mid,
    name: prop.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    name: null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result.name, prop.name + "updated");
});

test("update_property key", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result;
  var new_key = schema_helpers.generate_property_key(prop.name + "updated");
  update_property({
    type: type.mid,
    id: prop.mid,
    key: new_key
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    key: {
      namespace: type.mid,
      value: new_key
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
});

test("update_property expected_type", function() {
  var type, type2, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type2 = created;
    });
  acre.async.wait_on_results();
  ok(type2, "test type2 created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result;
  update_property({
    type: type.mid,
    id: prop.mid,
    expected_type: type.mid
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/expected_type": {
      id: type.mid
    }
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");

  var result2;
  update_property({
    type: type.mid,
    id: prop.mid,
    expected_type: type2.mid
  })
  .then(function(id) {
    result2 = id;
  });
  acre.async.wait_on_results();
  ok(result2, "got update_property result: " + result2);

  var check_result2;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/expected_type": {
      id: type2.mid
    }
  })
  .then(function(env) {
    check_result2 = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result2, "got check result");
});

test("update_property description", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result;
  update_property({
    type: type.mid,
    id: prop.mid,
    description: prop.name + "updated"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    "/freebase/documented_object/tip": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result["/freebase/documented_object/tip"], prop.name + "updated");

  var result2;
  update_property({
    type: type.mid,
    id: prop.mid,
    description: prop.name + "updated again"
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result2;
  freebase.mqlread({
    id: prop.mid,
    "/freebase/documented_object/tip": null
  })
  .then(function(env) {
    check_result2 = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result2, "got check result");
  equal(check_result2["/freebase/documented_object/tip"], prop.name + "updated again");
});

test("update_property unit, unique, disambiguator, hidden", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result;
  update_property({
    type: type.mid,
    id: prop.mid,
    unit: "/en/meter",
    unique: true,
    disambiguator: true,
    hidden: true
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/unit": null,
    "/type/property/unique": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result["/type/property/unit"], "/en/meter");
  ok(check_result["/type/property/unique"]);
  ok(check_result["/freebase/property_hints/disambiguator"]);
  ok(check_result["/freebase/property_hints/display_none"]);

  var result2;
  update_property({
    type: type.mid,
    id: prop.mid,
    unit: "/en/kilogram",
    unique: false,
    disambiguator: false,
    hidden: false
  })
  .then(function(id) {
    result2 = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result2;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/unit": null,
    "/type/property/unique": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result2 = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result2, "got check result");
  equal(check_result2["/type/property/unit"], "/en/kilogram");
  ok(!check_result2["/type/property/unique"]);
  ok(!check_result2["/freebase/property_hints/disambiguator"]);
  ok(!check_result2["/freebase/property_hints/display_none"]);
});

test("update_property enumeration", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");
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

  var result;
  update_property({
    type: type.mid,
    id: prop.mid,
    expected_type: "/type/enumeration",
    enumeration: namespace.mid,
    unit: "/en/meter",   // unit should be ignored
    unique: true,        // unique should be ignored
    disambiguator: true,
    hidden: true
  })
  .then(function(id) {
    result = id;
  });
  acre.async.wait_on_results();
  ok(result, "got update_property result: " + result);

  var check_result;
  freebase.mqlread({
    id: prop.mid,
    "/type/property/expected_type": null,
    "/type/property/enumeration": null,
    "/type/property/unit": null,
    "/type/property/unique": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  })
  .then(function(env) {
    check_result = env.result;
  });
  acre.async.wait_on_results();
  ok(check_result, "got check result");
  equal(check_result["/type/property/expected_type"], "/type/enumeration");
  equal(check_result["/type/property/enumeration"], namespace.id);
  ok(!check_result["/type/property/unit"]);
  ok(!check_result["/type/property/unique"]);
  ok(check_result["/freebase/property_hints/disambiguator"]);
  ok(check_result["/freebase/property_hints/display_none"]);
});

test("update_property enumeration in non-namespace", function() {
  var type, prop;
  test_helpers.create_type2(user_domain)
    .then(function(created) {
      type = created;
    });
  acre.async.wait_on_results();
  ok(type, "test type created");
  test_helpers.create_property2(type.mid)
    .then(function(created) {
      prop = created;
    });
  acre.async.wait_on_results();
  ok(prop, "test prop created");

  var result, error;
  update_property({
    type: type.mid,
    id: prop.mid,
    expected_type: "/type/enumeration",
    enumeration: type.mid
  })
  .then(function(r) {
    result = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(!result, "expected result");
  ok(error, "expected error: " + error);
});

acre.test.report();
