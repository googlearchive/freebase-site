acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var q = mf.require("queries");
var mql = mf.require("mql");
var ht = mf.require("test", "helpers");


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

test("add_included_types", function() {
  var type = ht.create_type(user_domain);
  try {
    var result;
    q.add_included_types(type.id, ["/people/person", "/film/actor"])
      .then(function(included) {
        result = included;
      });
    acre.async.wait_on_results();
    ok(result);
    result = acre.freebase.mqlread({id: type.id, "/freebase/type_hints/included_types": [{id:null}]}).result;
    result = result["/freebase/type_hints/included_types"];
    ok(result.length === 2);
    var included = {};
    result.forEach(function(type) {
      included[type.id] = true;
    });
    ["/people/person", "/film/actor"].forEach(function(type) {
      ok(included[type], type + " is included");
    });
  }
  finally {
    if (type) ht.delete_type(type);
  }
});

test("delete_included_type", function() {
  var type = ht.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/people/person"}});
  // make sure of included type
  equal(type["/freebase/type_hints/included_types"].id, "/people/person");

  try {
    var result;
    q.delete_included_type(type.id, "/people/person")
      .then(function(deleted) {
        result = deleted;
      });
    acre.async.wait_on_results();
    ok(result);
    result = acre.freebase.mqlread({id: type.id, "/freebase/type_hints/included_types": null}).result;
    ok(!result["/freebase/type_hints/included_types"]);
  }
  finally {
    if (type) ht.delete_type(type);
  }
});


test("add_instance", function() {
  var type = ht.create_type(user_domain, {"/freebase/type_hints/included_types": [{id: "/common/topic"},{id: "/people/person"}]});
  try {
    var topic = acre.freebase.mqlwrite({id:null, create:"unconditional"}).result;
    ok(topic.id, topic.id);
    var result;
    q.add_instance(topic.id, type.id)
      .then(function(instance) {
        result = instance;
      });
    acre.async.wait_on_results();
    ok(result);
    result = acre.freebase.mqlread({id:topic.id, type:[]}).result;
    var types = {};
    result.type.forEach(function(t) {
      types[t] = true;
    });
    [type.id, "/common/topic", "/people/person"].forEach(function(t) {
      ok(types[t], t);
    });
  }
  finally {
    if (type) ht.delete_type(type);
  }
});

test("delete_instance", function() {
  var topic = acre.freebase.mqlwrite({id:null, type:"/people/person", create:"unconditional"}).result;
  ok(topic.id, topic.id);
  var result;
  q.delete_instance(topic.id, "/people/person")
    .then(function(deleted) {
      result = deleted;
    });
  acre.async.wait_on_results();
  ok(result);
  result = acre.freebase.mqlread({id:topic.id, type:null}).result;
  ok(result.type == null, result.type);
});

acre.test.report();

