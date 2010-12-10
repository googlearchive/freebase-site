acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var h = mf.require("test", "helpers");
var create_topic = mf.require("create_topic").create_topic;

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
  return  "test_create_topic_" + h.random();
};

test("create_topic name", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, topic.id);

  topic = acre.freebase.mqlread({id:topic.id, name:null}).result;
  equal(topic.name, name);
});

test("create_topic type", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/people/person"}});
  try {
    var topic;
    var name = get_name();
    create_topic({
      name: name,
      type: type.id
    })
    .then(function(created) {
      topic = created;
    });
    acre.async.wait_on_results();
    ok(topic, topic.id);

    topic = acre.freebase.mqlread({id:topic.id, name:null, type:[]}).result;
    equal(topic.name, name);

    // check for type AND included_types
    var types = {};
    topic.type.forEach(function(type) {
      types[type] = true;
    });
    [type.id, "/people/person"].forEach(function(type) {
      ok(types[type], type);
    });
  }
  finally {
    if (type) h.delete_type(type);
  }
});

test("create_topic description", function() {
  var topic;
  var name = get_name();
  create_topic({
    name: name,
    description: name
  })
  .then(function(created) {
    topic = created;
  });
  acre.async.wait_on_results();
  ok(topic, topic.id);

  topic = acre.freebase.mqlread({id:topic.id, name:null, "/common/topic/article":{id:null}}).result;
  equal(topic.name, name);
  var blurb = acre.freebase.get_blob(topic["/common/topic/article"].id, "blurb").body;
  equal(blurb, name);
});


test("create_topic included_types", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/people/person"}});
  try {
    var topic;
    var name = get_name();
    create_topic({
      name: name,
      type: type.id,
      included_types: false
    })
    .then(function(created) {
      topic = created;
    });
    acre.async.wait_on_results();
    ok(topic, topic.id);

    topic = acre.freebase.mqlread({id:topic.id, name:null, type:[]}).result;
    equal(topic.name, name);

    // check just for type and NO included types of /people/person
    var types = {};
    topic.type.forEach(function(type) {
      types[type] = true;
    });
    ok(types[type.id], type.id);
    ok(!types["/people/person"], "/people/person");
  }
  finally {
    if (type) h.delete_type(type);
  }
});


test("create_topic unless_exists", function() {
  var type = h.create_type(user_domain, {"/freebase/type_hints/included_types": {id: "/people/person"}});
  var name = get_name();
  // create article
  var article = acre.freebase.mqlwrite({id:null, type:"/common/document", create: "unconditional"}).result;
  acre.freebase.upload(name, "text/html", {document: article.id});
  var existing = acre.freebase.mqlwrite({
    id: null,
    name: name,
    type: type.id,
    "/common/topic/article": {id: article.id},
    create: "unconditional"
  }).result;

  try {
    var topic;
    create_topic({
      name: name,
      type: type.id,
      included_types: true,
      description: name+"update",
      create:"unless_exists"
    })
    .then(function(created) {
      topic = created;
    });
    acre.async.wait_on_results();
    ok(topic, topic.id);
    equal(topic.id, existing.id);

    topic = acre.freebase.mqlread({id:topic.id, name:null, type:[], "/common/topic/article":{id:null}}).result;
    equal(topic.name, name);

    // check for type AND included_types
    var types = {};
    topic.type.forEach(function(type) {
      types[type] = true;
    });
    [type.id, "/people/person"].forEach(function(type) {
      ok(types[type], type);
    });

    var blurb = acre.freebase.get_blob(topic["/common/topic/article"].id, "blurb").body;
    equal(blurb, name+"update");
  }
  finally {
    if (type) h.delete_type(type);
  }
});


acre.test.report();
