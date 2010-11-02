acre.require('/test/lib').enable(this);

var q = acre.require("queries");

test("has_permission.domain", function() {
  var result;
  q.has_permission("/freebase", "/user/daepark")
    .then(function(has_permission) {
      result = has_permission;
    });
  acre.async.wait_on_results();
  ok(result);
});

test("has_permission.domain.dont_allow_experts", function() {
  var result;
  q.has_permission("/freebase", "/user/tfmorris")
    .then(function(has_permission) {
      result = has_permission;
    });
  acre.async.wait_on_results();
  ok(!result);
});

test("has_permission.domain.allow_experts", function() {
  var result;
  q.has_permission("/freebase", "/user/tfmorris", true)
    .then(function(has_permission) {
      result = has_permission;
    });
  acre.async.wait_on_results();
  ok(result);
});

test("has_permission.type", function() {
  var result;
  q.has_permission("/base/slamdunk/player", "/user/daepark")
    .then(function(has_permission) {
      result = has_permission;
    });
  acre.async.wait_on_results();
  ok(result);
});

acre.test.report();

