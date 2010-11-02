acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var freebase = mf.require("promise", "apis").freebase;
var blob = acre.require("blob");

test("get_blob", function() {
  var q = {
    "id": "/architecture",
    "/common/topic/article": {
      "limit":1,
      "id": null
    }
  };
  var result;
  freebase.mqlread(q)
    .then(function(env) {
      return blob.get_blob(env.result["/common/topic/article"].id);
    })
    .then(function(res) {
      result = res;
    });
  acre.async.wait_on_results();
  console.log("get_blob", result);
  ok(result);
});

test("get_blurb", function() {
  var q = {
    "id": "/architecture",
    "/common/topic/article": {
      "limit":1,
      "id": null
    }
  };
  var result;
  freebase.mqlread(q)
    .then(function(env) {
      return blob.get_blurb(env.result["/common/topic/article"].id);
    })
    .then(function(res) {
      result = res;
    });
  acre.async.wait_on_results();
  console.log("get_blurb", result);
  ok(result);
});

acre.test.report();
