acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var sh = mf.require("helpers");
var h = mf.require("test", "helpers");
var create_property = mf.require("create_property").create_property;

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

function get_name() {
  return  "test_create_property_" + h.random();
};

test("create_property", function() {
  var type = h.create_type(user_domain);
  var prop;
  try {
    var prop_name = get_name();
    create_property({
      type: type.id,
      name: prop_name,
      key: sh.generate_property_key(prop_name),
      expected_type: type.id
    })
    .then(function(r) {
      prop = r;
    });
    acre.async.wait_on_results();
    ok(prop, "test prop created " + prop.id);

    var result = acre.freebase.mqlread({
      id: prop.id,
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
    }).result;
    equal(result.name, prop_name);
    equal(result.key.value, sh.generate_property_key(prop_name));
    equal(result.schema, type.id);
    ok(!result.unit);
    ok(!result.unique);
    equal(result.expected_type, type.id);
    ok(!result["/freebase/documented_object/tip"]);
    ok(!result["/freebase/property_hints/disambiguator"]);
    ok(!result["/freebase/property_hints/display_none"]);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});


test("create_property options", function() {
  var type = h.create_type(user_domain);
  var prop;
  try {
    var prop_name = get_name();
    create_property({
      type: type.id,
      name: prop_name,
      key: sh.generate_property_key(prop_name),
      expected_type: type.id,
      unit: "/en/meter",
      unique: true,
      disambiguator: true,
      hidden: true,
      description: prop_name
    })
    .then(function(r) {
      prop = r;
    });
    acre.async.wait_on_results();
    ok(prop, "test prop created " + prop.id);

    var result = acre.freebase.mqlread({
      id: prop.id,
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
    }).result;
    equal(result.name, prop_name);
    equal(result.key.value, sh.generate_property_key(prop_name));
    equal(result.schema, type.id);
    equal(result.unit, "/en/meter");
    ok(result.unique);
    equal(result.expected_type, type.id);
    equal(result["/freebase/documented_object/tip"], prop_name);
    ok(result["/freebase/property_hints/disambiguator"]);
    ok(result["/freebase/property_hints/display_none"]);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type) h.delete_type(type);
  }
});


test("create_property enumeration in namespace", function() {
  var type = h.create_type(user_domain);
  var namespace = acre.freebase.mqlwrite({
    id: null,
    mid: null,
    type: "/type/namespace",
    key: {
      namespace: type.id,
      value: h.random().toLowerCase()
    },
    create: "unconditional"
  }).result;
  var prop;
  try {
    var prop_name = get_name();
    create_property({
      type: type.id,
      name: prop_name,
      key: sh.generate_property_key(prop_name),
      expected_type: "/type/enumeration",
      enumeration: namespace.id,
      unit: "/en/meter",   // unit should be ignored
      unique: true,        // unique should be ignored
      disambiguator: true,
      hidden: true,
      description: prop_name
    })
    .then(function(r) {
      prop = r;
    });
    acre.async.wait_on_results();
    ok(prop, "test prop created " + prop.id);

    var result = acre.freebase.mqlread({
      id: prop.id,
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
    }).result;
    equal(result.name, prop_name);
    equal(result.key.value, sh.generate_property_key(prop_name));
    equal(result.schema, type.id);
    ok(!result.unit);
    ok(!result.unique);
    equal(result.expected_type, "/type/enumeration");
    equal(result.enumeration, namespace.id);
    equal(result["/freebase/documented_object/tip"], prop_name);
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


test("create_property enumeration in non-namespace", function() {
  var type = h.create_type(user_domain);
  var prop, rejected;
  try {
    var prop_name = get_name();
    create_property({
      type: type.id,
      name: prop_name,
      key: sh.generate_property_key(prop_name),
      expected_type: "/type/enumeration",
      enumeration: type.id
    })
    .then(function(r) {
      prop = r;
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
