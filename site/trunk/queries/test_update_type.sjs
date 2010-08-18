acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("helpers_test");
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

    var result = acre.freebase.mqlread({id:updated, key:{namespace:user.id+"/default_domain", value:null}}).result;
    equal(result.key.value, acre.freebase.mqlkey_quote(type.name+"updated"));
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});


test("update_type typehint", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/common/topic"}});
  try {
    var updated;
    update_type({
      domain: user_domain,
      id: type.id,
      typehint: "mediator"
    })
    .then(function(id) {
      updated = id;
    });
    acre.async.wait_on_results();
    ok(updated, updated);

    var result = acre.freebase.mqlread({
      id:updated,
      "/freebase/type_hints/mediator":null,
      "/freebase/type_hints/included_types":[]
    }).result;
    ok(result["/freebase/type_hints/mediator"], "updated as mediator");
    ok(![id for each (id in result["/freebase/type_hints/included_types"])].length, "/common/topic is not an included_type");
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
