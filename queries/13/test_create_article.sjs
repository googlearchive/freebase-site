acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var create_article = acre.require("create_article").create_article;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}


test("create_article", function() {
  var result;
  var content = "test_create_article";
  create_article(content, "text/html")
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result);

  // check blob
  freebase.get_blob(result.id, "blurb")
    .then(function(blob) {
      result = blob.body;
    });
  acre.async.wait_on_results();
  equal(result, content); 
});

test("create_article with permission", function() {
  var result;
  var content = "test_create_article with permission";
  create_article(content, "text/html", {use_permission_of: user.id + "/default_domain"})
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result);

  // check permission
  var q = {
    id: result.id,
    permission: {
      id: null,
      "!/type/object/permission": {
        id: user.id + "/default_domain"
      }
    }
  };
  result = false;
  freebase.mqlread(q)
    .then(function(env) {
      result = env.result;
    });
  acre.async.wait_on_results();
  ok(result, result.permission["!/type/object/permission"].id);
});


test("create_article with topic", function() {
  var result, topic;
  var content = "test_create_article with topic";

  var q = {
    id: null,
    create: "unconditional"
  };
  freebase.mqlwrite(q)
    .then(function(env) {
      topic = env.result.id;
      return create_article(content, "text/html", {topic:topic})
        .then(function(doc) {
          result = doc;
        });
    });
  acre.async.wait_on_results();
  ok(result, result.id);

  q = {
    id: topic,
    "/common/topic/article": {
      id: result.id
    }
  };
  result = false;
  freebase.mqlread(q)
    .then(function(env) {
      result = env.result;
    });
  acre.async.wait_on_results();
  ok(result, result["/common/topic/article"].id);
});

acre.test.report();
