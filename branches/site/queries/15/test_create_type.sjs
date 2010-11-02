acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = mf.require("helpers_test");
var create_type = mf.require("create_type").create_type;

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
  return  "test_create_type_" + h.random();
};

test("create_type", function() {
  var type;
  try {
    var name = get_name();
    create_type({
      domain: user_domain,
      name: name,
      key: name,
      mqlkey_quote: true
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);
    equal(type.key.value, acre.freebase.mqlkey_quote(name));

    // assert included type /common/topic
    var result = acre.freebase.mqlread({
      id: type.id,
      "/freebase/type_hints/included_types": {id:"/common/topic"},
      permission: {
        id: null,
        "!/type/object/permission": {id: user_domain}
      }
    }).result;
    ok(result);
    equal(result["/freebase/type_hints/included_types"].id, "/common/topic");
    equal(result.permission["!/type/object/permission"].id,  user_domain);
  }
  finally {
    if (type) {
      h.delete_type(type);
    }
  }
});

test("create_type mediator", function() {
  var type;
  try {
    var name = get_name();
    create_type({
      domain: user_domain,
      name: name,
      key: name,
      role: "mediator",
      mqlkey_quote: true
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);
    equal(type.key.value, acre.freebase.mqlkey_quote(name));

    // assert /freebase/type_hints/mediator and /freebase/type_hints/role
    // and no included types
    var result = acre.freebase.mqlread({
      id: type.id,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result);
    ok(result["/freebase/type_hints/mediator"]);
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

test("create_type cvt", function() {
  var type;
  try {
    var name = get_name();
    create_type({
      domain: user_domain,
      name: name,
      key: name,
      role: "cvt",
      mqlkey_quote: true
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);
    equal(type.key.value, acre.freebase.mqlkey_quote(name));

    // assert /freebase/type_hints/mediator and /freebase/type_hints/role
    var result = acre.freebase.mqlread({
      id: type.id,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result);
    ok(result["/freebase/type_hints/mediator"]);
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

test("create_type enumeration", function() {
  var type;
  try {
    var name = get_name();
    create_type({
      domain: user_domain,
      name: name,
      role: "enumeration",
      key: name,
      mqlkey_quote: true
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);
    equal(type.key.value, acre.freebase.mqlkey_quote(name));

    // assert included type /common/topic
    var result = acre.freebase.mqlread({
      id:type.id,
      "/freebase/type_hints/enumeration": null,
        "/freebase/type_hints/role": {optional:true, id: null},
      "/freebase/type_hints/included_types": []
    }).result;
    ok(result);
    ok(result["/freebase/type_hints/enumeration"]);
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


test("create_type no name", function() {
  var type, error;
  var name = get_name();
  create_type({
    domain: user_domain,
    name: "",
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type no key", function() {
  var type, error;
  var name = get_name();
  create_type({
    domain: user_domain,
    name: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type bad key", function() {
  var type, error;
  var name = get_name();
  create_type({
    domain: user_domain,
    name: name,
    key: "!@#$%^&*()_+"
  })
  .then(function(r) {
    type = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});

test("create_type no domain", function() {
  var type, error;
  var name = get_name();
  create_type({
    name: name,
    key: name,
    mqlkey_quote: true
  })
  .then(function(r) {
    type = r;
  }, function(e) {
    error = e;
  });
  acre.async.wait_on_results();
  ok(error, ""+error);
});


test("create_type with description", function() {
  var type;
  try {
    var name = get_name();
    create_type({
      domain: user_domain,
      name: name,
      key: name,
      mqlkey_quote: true,
      description: name
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);

    // assert /common/topic/article
    var result = acre.freebase.mqlread({
      id: type.id,
      "/common/topic/article": {
        id: null,
        permission: {
          id: null,
          "!/type/object/permission": {
            id: user.id + "/default_domain"
          }
        }
      }
    }).result;

    var blurb = acre.freebase.get_blob(result["/common/topic/article"].id, "blurb").body;
    equal(blurb, name);
  }
  finally {
      if (type) {
        h.delete_type(type);
      }
  }
});

acre.test.report();
