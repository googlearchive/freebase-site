acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("queries", "helpers_test");
var update_type = mf.require("update_type").update_type;

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

test("update_type name", function() {
  var type = h.create_type(user_domain);
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      name: type.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, name:null}).result;
    equal(result.name, type.name + "updated");
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("update_type key", function() {
  var type = h.create_type(user_domain);
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      key: type.name+"updated",
      mqlkey_quote: true
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id:updated, key:{namespace:user_domain, value:null}}).result;
    equal(result.key.value, acre.freebase.mqlkey_quote(type.name+"updated"));
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("update_type mediator", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/common/topic"}});
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      role: "mediator"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result["/freebase/type_hints/mediator"], "updated as mediator");
    equal(result["/freebase/type_hints/role"].id, "/freebase/type_role/mediator");
    var common_topic = [t for each (t in result["/freebase/type_hints/included_types"]) if (t === "/common/topic")];
    ok(!common_topic.length);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});

test("update_type cvt", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/common/topic"}});
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      role: "cvt"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result["/freebase/type_hints/mediator"], "updated as cvt");
    equal(result["/freebase/type_hints/role"].id, "/freebase/type_role/cvt");
    var common_topic = [t for each (t in result["/freebase/type_hints/included_types"]) if (t === "/common/topic")];
    ok(!common_topic.length);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("update_type enumeration", function() {
  var type = h.create_type(user_domain);
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      role: "enumeration"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/freebase/type_hints/enumeration": null,
      "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result["/freebase/type_hints/enumeration"], "updated as enumeration");
    equal(result["/freebase/type_hints/role"].id, "/freebase/type_role/enumeration");
    var common_topic = [t for each (t in result["/freebase/type_hints/included_types"]) if (t === "/common/topic")];
    ok(common_topic.length);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});

test("update_type description", function() {
  var type = h.create_type(user_domain);
  try {
    var updated, description;
    update_type({
      domain: user_domain,
      id: type.id,
      description: type.name + "updated"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({id: updated, "/common/topic/article": {id: null}}).result;
    var blurb = acre.freebase.get_blob(result["/common/topic/article"].id, "blurb").body;
    equal(blurb, type.name + "updated");
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});



acre.test.report();
