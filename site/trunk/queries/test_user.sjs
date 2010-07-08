acre.require('/test/lib').enable(this);

var u = acre.require("user");

test("user", function() {
  var result;
  u.user("/user/daepark")
    .then(function(user) {
      result = user;
    });
  acre.async.wait_on_results();
  ok(result);
  equal(result.name, "daepark");
  equal(result["image"].length, 1);
  ok(!result["badge"]);
});

test("user_badges", function() {
  var result;
  u.user("/user/daepark", true)
    .then(function(user) {
      result = user;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result["badges"].length);
});

acre.test.report();
