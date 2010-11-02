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
  ok(!result["badges:/type/user/usergroup"]);
});

test("user_badges", function() {
  var result;
  u.user("/user/daepark", true)
    .then(function(user) {
      result = user;
    });
  acre.async.wait_on_results();
  ok(result);
  ok(result["badges:/type/user/usergroup"].length);
});

acre.test.report();
