acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("queries", "helpers_test");
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
      key: prop_name,
      expected_type: type.id,
      mqlkey_quote: true
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
    equal(result.key.value, acre.freebase.mqlkey_quote(prop_name));
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
      key: prop_name,
      expected_type: type.id,
      unit: "/en/meter",
      unique: true,
      disambiguator: true,
      hidden: true,
      description: prop_name,
      mqlkey_quote: true
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
    equal(result.key.value, acre.freebase.mqlkey_quote(prop_name));
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

acre.test.report();
