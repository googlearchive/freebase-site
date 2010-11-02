acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var lib = acre.require("create_article");
var create_article = lib.create_article;
var upload = lib.upload;

// this test requires user to be logged in
var user = acre.freebase.get_user_info();

test("login required", function() {
  ok(user, "login required");
});

if (!user) {
  acre.test.report();
  acre.exit();
}

test("upload", function() {
  var result;
  var content = "test_upload";
  upload(content, "text/html")
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result);

  // check blob
  result = acre.freebase.get_blob(result.id, "blurb").body;
  equal(result, content);
});

test("upload with document", function() {
  var result;

  var article = acre.freebase.mqlwrite({id:null, type:"/common/document", create:"unconditional"}).result;

  var content = "test_upload with document";
  upload(content, "text/html", {document: article.id})
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result);

  // check blob
  result = acre.freebase.get_blob(article.id, "blurb").body;
  equal(result, content);
});

test("upload with lang", function() {
  var result;
  var content = "test_upload with lang";
  upload(content, "text/html", {lang: "/lang/ko"})
    .then(function(uploaded) {
      result = uploaded;
    });
  acre.async.wait_on_results();
  ok(result);

  // check lang
  result = acre.freebase.mqlread({id:result.id, "/type/content/language": null}).result;
  equal(result["/type/content/language"], "/lang/ko");
});

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
  result = acre.freebase.get_blob(result.id, "blurb").body;
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
  result = acre.freebase.mqlread(q).result;
  ok(result, result.permission["!/type/object/permission"].id);
});

test("create_article with topic", function() {
  var result, topic;
  var content = "test_create_article with topic";

  var q = {
    id: null,
    create: "unconditional"
  };
  topic = acre.freebase.mqlwrite(q).result.id;

  create_article(content, "text/html", {topic:topic})
    .then(function(doc) {
      result = doc;
    });
  acre.async.wait_on_results();
  ok(result, result.id);

  q = {
    id: topic,
    "/common/topic/article": {
      id: result.id
    }
  };
  result = acre.freebase.mqlread(q).result;
  ok(result, result["/common/topic/article"].id);
});

acre.test.report();
