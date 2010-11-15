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

var mf = acre.require("MANIFEST").mf;
var sh = mf.require("helpers");
var h = mf.require("test", "helpers");
var update_property = mf.require("update_property").update_property;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

var user_domain = user.id + "/default_domain";

test("update_property name", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      name: prop.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, name:null}).result;
    equal(result.name, prop.name + "updated");
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});

test("update_property key", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      key: sh.generate_property_key(prop.name + "updated")
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, key:{namespace:type.id, value:null}}).result;
    equal(result.key.value, sh.generate_property_key(prop.name + "updated"));
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});

test("update_property expected_type", function() {
  var type = h.create_type(user_domain);
  var type2 = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      expected_type: type.id
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, "/type/property/expected_type":null}).result;
    equal(result["/type/property/expected_type"], type.id);

    update_property({
      type: type.id,
      id: prop.id,
      expected_type: type2.id
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    result = acre.freebase.mqlread({id:updated, "/type/property/expected_type":null}).result;
    equal(result["/type/property/expected_type"], type2.id);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type2) h.delete_type(type2);
    if (type) h.delete_type(type);
  }
});

test("update_property description", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      description: prop.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, "/freebase/documented_object/tip":null}).result;
    equal(result["/freebase/documented_object/tip"], prop.name + "updated");

    update_property({
      type: type.id,
      id: prop.id,
      description: prop.name + "updated again"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    result = acre.freebase.mqlread({id:updated, "/freebase/documented_object/tip":null}).result;
    equal(result["/freebase/documented_object/tip"], prop.name + "updated again");
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});

test("update_property unit, unique, disambiguator, hidden", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      unit: "/en/meter",
      unique: true,
      disambiguator: true,
      hidden: true
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/type/property/unit": null,
      "/type/property/unique": null,
      "/freebase/property_hints/disambiguator": null,
      "/freebase/property_hints/display_none": null
    }).result;
    equal(result["/type/property/unit"], "/en/meter");
    ok(result["/type/property/unique"]);
    ok(result["/freebase/property_hints/disambiguator"]);
    ok(result["/freebase/property_hints/display_none"]);

    update_property({
      type: type.id,
      id: prop.id,
      unit: "/en/kilogram",
      unique: false,
      disambiguator: false,
      hidden: false
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    result = acre.freebase.mqlread({
      id:updated,
      "/type/property/unit": null,
      "/type/property/unique": null,
      "/freebase/property_hints/disambiguator": null,
      "/freebase/property_hints/display_none": null
    }).result;
    equal(result["/type/property/unit"], "/en/kilogram");
    ok(!result["/type/property/unique"]);
    ok(!result["/freebase/property_hints/disambiguator"]);
    ok(!result["/freebase/property_hints/display_none"]);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});

test("update_property enumeration", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);
  var namespace =  acre.freebase.mqlwrite({
    id: null,
    mid: null,
    type: "/type/namespace",
    key: {
      namespace: type.id,
      value: h.random().toLowerCase()
    },
    create: "unconditional"
  }).result;
  try {
    var updated;
    update_property({
      type: type.id,
      id: prop.id,
      expected_type: "/type/enumeration",
      enumeration: namespace.id,
      unit: "/en/meter",   // unit should be ignored
      unique: true,        // unique should be ignored
      disambiguator: true,
      hidden: true
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/type/property/expected_type": null,
      "/type/property/enumeration": null,
      "/type/property/unit": null,
      "/type/property/unique": null,
      "/freebase/property_hints/disambiguator": null,
      "/freebase/property_hints/display_none": null
    }).result;
    equal(result["/type/property/expected_type"], "/type/enumeration");
    equal(result["/type/property/enumeration"], namespace.id);
    ok(!result["/type/property/unit"]);
    ok(!result["/type/property/unique"]);
    ok(result["/freebase/property_hints/disambiguator"]);
    ok(result["/freebase/property_hints/display_none"]);

  }
  finally {
    if (prop) h.delete_property(prop);
    if (namespace) {
      acre.freebase.mqlwrite({
        id: namespace.mid,
        type: {id:"/type/namespace", connect:"delete"},
        key: {namespace:namespace.key.namespace, value:namespace.key.value, connect:"delete"}
      });
    }
    if (type) h.delete_type(type);
  }
});

test("update_property enumeration in non-namespace", function() {
  var type = h.create_type(user_domain);
  var prop = h.create_property(type.id);

  try {
    var success, rejected;
    update_property({
      type: type.id,
      id: prop.id,
      expected_type: "/type/enumeration",
      enumeration: type.id
    })
    .then(function(id) {
      success = id;
    }, function(error) {
      rejected = error;
    });
    acre.async.wait_on_results();
    ok(rejected, rejected);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});

acre.test.report();
