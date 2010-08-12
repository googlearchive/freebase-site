acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
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

test("create_type", function() {
  var success;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  });
  acre.async.wait_on_results();
  ok(success);
  equal(success.key.value, acre.freebase.mqlkey_quote(name));

  // assert included type /common/topic
  freebase.mqlread({
    id:success.id,
    "/freebase/type_hints/included_types": {id:"/common/topic"},
    permission: {
      id: null,
      "!/type/object/permission": {id: user.id + "/default_domain"}
    }
  })
  .then(function(env) {
    success = env.result;
  });
  acre.async.wait_on_results();
  ok(success);
  equal(success["/freebase/type_hints/included_types"].id, "/common/topic");
  equal(success.permission["!/type/object/permission"].id,  user.id + "/default_domain");

  // delete type
  delete_type(success.id, user.id, true);
  acre.async.wait_on_results();
});

test("create_type mediator", function() {
  var success;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    typehint: "mediator",
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  });
  acre.async.wait_on_results();
  ok(success);
  equal(success.key.value, acre.freebase.mqlkey_quote(name));

  // assert /freebase/type_hints/mediator
  freebase.mqlread({id:success.id, "/freebase/type_hints/mediator": null})
    .then(function(env) {
      success = env.result;
    });
  acre.async.wait_on_results();
  ok(success);
  ok(success["/freebase/type_hints/mediator"]);

  // delete type
  delete_type(success.id, user.id, true);
  acre.async.wait_on_results();
});

test("create_type enumeration", function() {
  var success;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    typehint: "enumeration",
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  });
  acre.async.wait_on_results();
  ok(success);
  equal(success.key.value, acre.freebase.mqlkey_quote(name));

  // assert included type /common/topic
  freebase.mqlread({
    id:success.id,
    "/freebase/type_hints/included_types": {id:"/common/topic"},
    "/freebase/type_hints/enumeration": null
  })
  .then(function(env) {
    success = env.result;
  });
  acre.async.wait_on_results();
  ok(success);
  equal(success["/freebase/type_hints/included_types"].id, "/common/topic");
  ok(success["/freebase/type_hints/enumeration"]);

  // delete type
  delete_type(success.id, user.id, true);
  acre.async.wait_on_results();
});


test("create_type no name", function() {
  var success, error;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: "",
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type no key", function() {
  var success, error;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type bad key", function() {
  var success, error;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name
  })
  .then(function(r) {
    success = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type no domain", function() {
  var success, error;
  var name = get_name();
  create_type({
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    success = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});


test("create_type with description", function() {
  var success, type;
  var name = get_name();
  create_type({
    domain: user.id + "/default_domain",
    name: name,
    key: name,
    mqlkey_quote: true,
    description: name
  })
  .then(function(r) {
    type = success = r;
  });
  acre.async.wait_on_results();
  ok(success);

  // assert /common/topic/article
  freebase.mqlread({
    id: success.id,
    "/common/topic/article": {
      id: null,
      permission: {
        id: null,
        "!/type/object/permission": {
          id: user.id + "/default_domain"
        }
      }
    }
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    return freebase.get_blob(result["/common/topic/article"].id, "blurb")
      .then(function(blob) {
        success = blob.body;
      });
  });
  acre.async.wait_on_results();
  equal(success, name);

  // delete type
  delete_type(type.id, user.id, true);
  acre.async.wait_on_results();
});

acre.test.report();
