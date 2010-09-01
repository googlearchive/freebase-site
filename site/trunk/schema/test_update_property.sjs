acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("queries", "helpers_test");
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
      key: prop.name + "updated",
      mqlkey_quote: true
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, key:{namespace:type.id, value:null}}).result;
    equal(result.key.value, acre.freebase.mqlkey_quote(prop.name+"updated"));
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


acre.test.report();
