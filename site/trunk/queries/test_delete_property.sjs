acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("helpers_test");
var delete_property = mf.require("delete_property").delete_property;
var undo = mf.require("delete_property").undo;

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

test("delete_property", function() {
  var type = h.create_type(user_domain);
  var type2 = h.create_type(user_domain);
  var prop = h.create_property(type.id, {"/type/property/expected_type": {id: type2.id}});
  try {
    var info, result;
    delete_property(prop.id, user.id, false, true)
      .then(function([prop_info, delete_result]) {
        info = prop_info;
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

    ok(result.expected_type.id === type2.id &&
       result.expected_type.connect === "deleted", "expected_type link deleted: " + type2.id);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type2) h.delete_type(type2);
    if (type) h.delete_type(type);
  }
});



test("undo", function() {
  var type = h.create_type(user_domain);
  var type2 = h.create_type(user_domain);
  var prop = h.create_property(type.id, {"/type/property/expected_type": {id: type2.id}});

  try {
    var info, result;
    delete_property(prop.id, user.id)
      .then(function([prop_info, delete_result]) {
        info = prop_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(result);
    ok(result.type.id === "/type/property" &&
       result.type.connect === "deleted", "type link deleted: " + prop.id);

    // undo
    undo(info)
      .then(function([prop_info, undo_result]) {
        info = prop_info;
        result = undo_result;
      });
    acre.async.wait_on_results();
    ok(result);
    ok(result.type.id === "/type/property" && result.type.connect === "inserted", JSON.stringify(result));

    // delete property
    delete_property(prop.id, user.id, false, true);
  }
  finally {
    if (prop) h.delete_property(prop);
    if (type2) h.delete_type(type2);
    if (type) h.delete_type(type);
  }
});


acre.test.report();
