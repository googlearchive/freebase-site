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
      typehint: "mediator",
      mqlkey_quote: true
    })
    .then(function(r) {
      type = r;
    });
    acre.async.wait_on_results();
    ok(type);
    equal(type.key.value, acre.freebase.mqlkey_quote(name));

    // assert /freebase/type_hints/mediator
    var result = acre.freebase.mqlread({id:type.id, "/freebase/type_hints/mediator": null}).result;
    ok(result);
    ok(result["/freebase/type_hints/mediator"]);
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
      typehint: "enumeration",
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
      "/freebase/type_hints/included_types": {id:"/common/topic"},
      "/freebase/type_hints/enumeration": null
    }).result;
    ok(result);
    equal(result["/freebase/type_hints/included_types"].id, "/common/topic");
    ok(result["/freebase/type_hints/enumeration"]);
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
