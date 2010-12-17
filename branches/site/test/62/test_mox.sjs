acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;

mf.require("test", "mox").playback(this, "playback_test_mox.json");

var urlfetch = mf.require("promise", "apis").urlfetch;
var freebase = mf.require("promise", "apis").freebase;
var deferred = mf.require("promise", "deferred");

function assert_freebase_result(result) {
  ok(result, "got result");
  equal(result.code, "/api/status/ok");
  equal(result.status, "200 OK");
};

test("mock_urlfetch", function() {
  var result;
  urlfetch("http://api.freebase.com/api/version")
    .then(function(response) {
      result = response;
    });
  acre.async.wait_on_results();
  ok(result, "got result");
  equal(result.status, "200");
});

test("mock_freebase_fetch", function() {
  /** how is this different from urlfetch? **/
  ok("skip");
});

test("mock_freebase_touch", function() {
  var result;
  freebase.touch()
    .then(function(response) {
      result = response;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
});

test("mock_freebase_get_user_info", function() {
  var result;
  freebase.get_user_info()
    .then(function(response) {
      result = response;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
  ["guid", "id", "name", "username"].forEach(function(key) {
    ok(key in result, key);
  });
});

test("mock_freebase_mqlread", function() {
  var result;
  freebase.mqlread({id:"/en/bob_dylan", name:null})
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
  result = result.result;
  ok(result, "got result");
  equal(result.name, "Bob Dylan");
});

test("mock_freebase_mqlread_multiple", function() {
  /** do we use this? why do we need this when you have async mqlread? **/
  ok("skip");
});

test("mock_freebase_mqlwrite", function() {
  var result;
  freebase.mqlwrite({
    id:null, name:{value:"test_mox.mock_freebase_mqlwrite", lang:"/lang/en"}, create:"unconditional"
  })
  .then(function(env) {
    result = env;
  });
  acre.async.wait_on_results();
  assert_freebase_result(result);
  result = result.result;
  ok(result, "got result");
  equal(result.create, "created", result.id);
});

test("mock_freebase_upload", function() {
  var result;
  freebase.upload("test_mox.mock_freebase_upload", "text/plain")
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
  result = result.result;
  ok(result, "got result");
  equal(result["/type/content/media_type"], "text/plain");
  equal(result["/type/content/length"], "test_mox.mock_freebase_upload".length);
});

test("mock_freebase_create_group", function() {
  /** async create_group is NOT working **/
  ok("skip");
});

test("mock_freebase_get_blob", function() {
  var result;
  freebase.get_blob("/en/bob_dylan")
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  ok(result, "got result");
  equal(result.status, "200");
  ok(result.body, result.body);
});

test("mock_freebase_get_topic", function() {
  /** async get_topic is NOT working **/
  ok("skip");
});

test("mock_freebase_get_topic_multi", function() {
  /** do we use this? why do we need this when you have async get_topic? **/
  ok("skip");
});

test("mock_freebase_search", function() {
  var result;
  freebase.search("Bob Dylan")
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
  result = result.result;
  ok(result && result.length, "got result");
});

test("mock_freebase_geosearch", function() {
  var result;
  freebase.geosearch("San Francisco")
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  assert_freebase_result(result);
});

test("mock_freebase_get_static", function() {
  var result;
  freebase.get_static("notable_types_2", "/en/bob_dylan")
    .then(function(env) {
      result = env;
    });
  acre.async.wait_on_results();
  ok(result, "got result");
  ok(result.notable_for && result.notable_for.length, "got notable_for");
  equal(result.notable_for[0].name, "Musician");
});

var self = this;

test("mock_deferreds", function() {
  var results = [];

  deferred.all([urlfetch("http://api.freebase.com/api/version"),
                urlfetch("http://api.freebase.com/api/service/touch")])
    .then(function(result) {
      results.push(result);
      return deferred.all([freebase.touch(), freebase.get_user_info()]);
    })
    .then(function(result) {
      results.push(result);
      return deferred.all([
        freebase.mqlwrite({
          id:null, name:{value:"test_mox.mock_deferreds", lang:"/lang/en"}, create:"unconditional"
        }),
        freebase.mqlwrite({
          id:null, type:"/common/document", create:"unconditional"
        })
      ]);
    })
    .then(function(result) {
      results.push(result);
    });
    acre.async.wait_on_results();

    var r;
    equal(results.length, 3, "expected 3 deferred results");

    // urlfetches
    r = results[0];
    ok(r, "got urlfetch results");
    equal(r.length, 2, "expected 2 urlfetch results");
    ok(r[0], "expected valid result for urlfetch: http://api.freebase.com/api/version");
    ok(r[1], "expected valid result for urlfetch: http://api.freebase.com/api/service/touch");
    equal(r[0].status, "200");
    equal(r[1].status, "200");

    // freebase.touch and freebase.get_user_info
    r = results[1];
    ok(r, "got freebase.touch and freebase.get_user_info results");
    equal(r.length, 2, "expected freebase.touch and freebase.get_user_info results");
    ok(r[0], "expected valid result for freebase.touch");
    ok(r[1], "expected valid result for freebase.get_user_info");
    ok(r[1].name, "expected name from freebase.get_user_info");

    // mqlwrite
    r = results[2];
    ok(r, "got mqlwrite results");
    equal(r.length, 2, "expected 2 mqlwrite results");
    ok(r[0], "expected valid result for new topic");
    ok(r[1], "expected valid result for new document");
    var topic = r[0].result;
    ok(topic, "got new topic");
    ok(topic.id, "go new topic id");
    var document = r[1].result;
    ok(document, "got new document");
    ok(document.id, "got new document id");

    var topic_with_article;

    // add article to topic
    freebase.upload("test_mox.mock_deferreds", "text/plain", {document:document.id})
      .then(function(uploaded) {
        return freebase.mqlwrite({
          id: topic.id,
          "/common/topic/article": {
            id: document.id,
            connect: "insert"
          }
        });
      })
      .then(function() {
        return freebase.mqlread({
          id: topic.id,
          name: {value:null, lang:"/lang/en"},
          "/common/topic/article": {id:null}
        })
        .then(function(env) {
          topic_with_article = env.result;
        });
      });
    acre.async.wait_on_results();
    ok(topic_with_article, "got topic with article");
    ok(topic_with_article.name, "got topic name");
    equal(topic_with_article.name.value, "test_mox.mock_deferreds");
    ok(topic_with_article["/common/topic/article"], "got topic article");

    var blobs;
    deferred.all([
      freebase.get_blob(topic.id),
      freebase.get_blob(topic_with_article["/common/topic/article"].id)
    ])
    .then(function(r) {
      blobs = r;
    });
    acre.async.wait_on_results();
    ok(blobs, "got blobs");
    equal(blobs.length, 2, "expected 2 blobs");
    ok(blobs[0], "expected valid blob for topic id");
    ok(blobs[1], "expected valid blob for document id");
    equal(blobs[0].body, "test_mox.mock_deferreds");
    equal(blobs[1].body, "test_mox.mock_deferreds");
});

acre.test.report();
