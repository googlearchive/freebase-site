acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var create_property = acre.require("create_property").create_property;
var create_type = acre.require("create_type").create_type;
var delete_type = acre.require("delete_type").delete_type;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

var counter = 0;
function get_name() {
  return  [user.username, user.transaction_id, counter++].join("_");
};

test("create_property", function() {
  var type, type_name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: type_name,
    key: type_name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type, "test type created " + type.id);

  var prop, prop_name = get_name();
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

  freebase.mqlread({
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
  })
  .then(function(env) {
    return prop = env.result;
  });
  acre.async.wait_on_results();
  equal(prop.name, prop_name);
  equal(prop.key.value, acre.freebase.mqlkey_quote(prop_name));
  equal(prop.schema, type.id);
  ok(!prop.unit);
  ok(!prop.unique);
  equal(prop.expected_type, type.id);
  ok(!prop["/freebase/documented_object/tip"]);
  ok(!prop["/freebase/property_hints/disambiguator"]);
  ok(!prop["/freebase/property_hints/display_none"]);

  // delete type
  delete_type(type.id, user.id, true);
  acre.async.wait_on_results();
});


test("create_property options", function() {
  var type, type_name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: type_name,
    key: type_name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type, "test type created " + type.id);

  var prop, prop_name = get_name();
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

  freebase.mqlread({
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
  })
  .then(function(env) {
    return prop = env.result;
  });
  acre.async.wait_on_results();
  equal(prop.name, prop_name);
  equal(prop.key.value, acre.freebase.mqlkey_quote(prop_name));
  equal(prop.schema, type.id);
  equal(prop.unit, "/en/meter");
  ok(prop.unique);
  equal(prop.expected_type, type.id);
  equal(prop["/freebase/documented_object/tip"], prop_name);
  ok(prop["/freebase/property_hints/disambiguator"]);
  ok(prop["/freebase/property_hints/display_none"]);

  // delete type
  delete_type(type.id, user.id, true);
  acre.async.wait_on_results();
});

acre.test.report();
