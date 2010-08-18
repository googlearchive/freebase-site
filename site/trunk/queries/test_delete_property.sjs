acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var create_type = acre.require("create_type").create_type;
var delete_type = acre.require("delete_type").delete_type;
var create_property = acre.require("create_property").create_property;
var delete_property = acre.require("delete_property").delete_property;

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

test("delete_property", function() {
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

  var info, result;
  delete_property(prop.id, user.id)
    .then(function([type_info, delete_result]) {
      info = type_info;
      result = delete_result;
    });
  acre.async.wait_on_results();
  ok(result);

  ok(result.type.id === "/type/property" &&
     result.type.connect === "deleted", "type link deleted: " + prop.id);

  ok(result.key[0].value === prop.key.value &&
     result.key[0].namespace === prop.key.namespace &&
     result.key[0].connect === "deleted", "key deleted: " + prop.key.value);

  ok(result.schema.id === prop.schema.id &&
     result.schema.connect === "deleted", "schema link deleted: " + prop.schema.id);

  ok(result.expected_type.id === type.id &&
     result.expected_type.connect === "deleted", "expected_type link deleted: " + type.id);

  // delete type
  delete_type(type.id, user.id, false, true);
  acre.async.wait_on_results();
});

acre.test.report();
