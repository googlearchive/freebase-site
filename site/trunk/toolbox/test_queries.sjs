acre.require('/test/lib').enable(this);

var q = acre.require("queries");

test("domain_membership", function() {
  var result;
  q.domain_membership("/user/daepark")
    .then(function(domains) {
      result = domains;
    });
  acre.async.wait_on_results();
  ok(result);
  ok([d for each (d in result) if (d.id == "/base/slamdunk")].length);
});

test("type_membership", function() {
  var result;
  q.type_membership("/user/daepark")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result);
  ok([d for each (d in result) if (d.id == "/base/slamdunk/player")].length);
});

test("user_queries", function() {
  var result;
  q.user_queries("/user/daepark")
    .then(function(types) {
      result = types;
    });
  acre.async.wait_on_results();
  ok(result);
  console.log(result);
  ok([d for each (d in result) if (d.id == "/base/slamdunk/views/slam_dunk_characters")].length);
});

acre.test.report();

