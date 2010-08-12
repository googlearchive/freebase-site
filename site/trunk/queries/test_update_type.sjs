acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var create_type = acre.require("create_type").create_type;
var delete_type = acre.require("delete_type").delete_type;
var update_type = acre.require("update_type").update_type;

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

test("update_type name", function() {
  var type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type.id, type.id);

  var updated;
  update_type({
    domain: user.id + "/default_domain",
    id: type.id,
    name: name + "updated"
  })
  .then(function(id) {
    updated = id;
  });
  acre.async.wait_on_results();
  ok(updated, updated);

  freebase.mqlread({id:updated, name:null})
    .then(function(env) {
      updated = env.result;
    });
  acre.async.wait_on_results();
  equal(updated.name, name + "updated");

  // delete type
  delete_type(type.id, user.id, false, true);
  acre.async.wait_on_results();
});


test("update_type key", function() {
  var type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type.id, type.id);

  var updated;
  update_type({
    domain: user.id + "/default_domain",
    id: type.id,
    key: name+"updated",
    mqlkey_quote: true
  })
  .then(function(id) {
    updated = id;
  });
  acre.async.wait_on_results();
  ok(updated, updated);

  freebase.mqlread({id:updated, key:{namespace:user.id+"/default_domain", value:null}})
    .then(function(env) {
      updated = env.result;
    });
  acre.async.wait_on_results();
  equal(updated.key.value, acre.freebase.mqlkey_quote(name+"updated"));

  // delete type
  delete_type(type.id, user.id, false, true);
  acre.async.wait_on_results();
});


test("update_type typehint", function() {
  var type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    typehint: "enumeration",
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type.id, type.id);

  var updated;
  update_type({
    domain: user.id + "/default_domain",
    id: type.id,
    typehint: "mediator"
  })
  .then(function(id) {
    updated = id;
  });
  acre.async.wait_on_results();
  ok(updated, updated);

  freebase.mqlread({id:updated, "/freebase/type_hints/mediator":null, "/freebase/type_hints/included_types":[]})
    .then(function(env) {
      updated = env.result;
    });
  acre.async.wait_on_results();
  ok(updated["/freebase/type_hints/mediator"], "updated as mediator");
  ok(![id for each (id in updated["/freebase/type_hints/included_types"])].length, "/common/topic is not an included_type");

  // delete type
  delete_type(type.id, user.id, false, true);
  acre.async.wait_on_results();
});


test("update_type description", function() {
  var type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    description: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  });
  acre.async.wait_on_results();
  ok(type.id, type.id);

  var updated, description;
  update_type({
    domain: user.id + "/default_domain",
    id: type.id,
    description: name + "updated"
  })
  .then(function(id) {
    console.log("updated", id);
    updated = id;
  });
  acre.async.wait_on_results();
  ok(updated, updated);

  freebase.mqlread({
    id: updated,
    "/common/topic/article": {
      id: null
    }
  })
  .then(function(env) {
    return freebase.get_blob(env.result["/common/topic/article"].id, "blurb")
      .then(function(blob) {
        description = blob.body;
      });
  });
  acre.async.wait_on_results();
  equal(description, name + "updated");

  // delete type
  delete_type(type.id, user.id, true);
  acre.async.wait_on_results();
});



acre.test.report();
