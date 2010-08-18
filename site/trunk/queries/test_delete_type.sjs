acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("helpers_test");
var delete_type = mf.require("delete_type").delete_type;
var undo = mf.require("delete_type").undo;

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

test("delete_type", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(result);

    ok(result.type.id === "/type/type" &&
       result.type.connect === "deleted", "type link deleted: " + type.id);

    ok(result.key[0].value === type.key.value &&
       result.key[0].namespace === type.key.namespace &&
       result.key[0].connect === "deleted", "key deleted: " + type.key.value);

    ok(result.domain.id === type.domain.id &&
       result.domain.connect === "deleted", "domain link deleted: " + type.domain.id);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("delete_type dry_run", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id, true)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    ok(info, JSON.stringify(info));
    ok(!result, JSON.stringify(result));

    equal(info.id, type.id, "type info.id: " + info.id);
    ok(info.key[0].value === type.key.value &&
       info.key[0].namespace === type.key.namespace, "type info.key: " + type.key.value);

    ok(info.domain.id === type.domain.id, "type info.domain: " + type.domain.id);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("undo", function() {
  var type = h.create_type(user_domain);
  try {
    var info, result;
    delete_type(type.id, user.id)
      .then(function([type_info, delete_result]) {
        info = type_info;
        result = delete_result;
      });
    acre.async.wait_on_results();
    // assert deleted
    ok(result.type.id === "/type/type" && result.type.connect === "deleted", JSON.stringify(result));

    // undo
    undo(info)
      .then(function([type_info, undo_result]) {
        info = type_info;
        result = undo_result;
      });
    acre.async.wait_on_results();
    ok(result);
    ok(result.type.id === "/type/type" && result.type.connect === "inserted", JSON.stringify(result));
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});



acre.test.report();
