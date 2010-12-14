acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;

mf.require("test", "mox").playback(this, "test_mox_playback.json");

var queries = mf.require("queries");

var urlfetch = mf.require("promise", "apis").urlfetch;
var freebase = mf.require("promise", "apis").freebase;
var deferred = mf.require("promise", "deferred");

test("sample", function() {
  deferred.all([urlfetch("http://www.freebase.com/private/version"),
                urlfetch("http://www.freebase.com/status"),
                freebase.mqlread({name: null, id: "/en/bryan"})])
  .then(function(responses) {
    equal(responses.length, 3);
    equal(responses[2].result.name, "Bryan");
  });
  acre.async.wait_on_results();
});


test("sample2", function() {
  freebase.mqlread({name: null, id: "/en/bryan"})
    .then(function(env) {
      ok(env.result, "Got result");
      equal(env.result.name, "Bryan");
      return env.result;
    })
    .then(function(result) {
      return freebase.mqlread({id:result.id, type:"/common/topic"})
        .then(function(env) {
          equal(env.result.type, "/common/topic");
        });
    });
  acre.async.wait_on_results();
});


test("test_query", function() {
  queries.test_query("/en/bob_dylan")
    .then(function(topic) {
      equal(topic.name, "Bob Dylan");
    });
  acre.async.wait_on_results();
});

acre.test.report();
