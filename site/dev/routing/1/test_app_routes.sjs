
acre.require('/test/lib').enable(this);

var routes = acre.require("app_routes").routes;

test("routes", function() {
  var keys = ["from", "to", "as", "app"];
  routes.forEach(function(route) {
    keys.forEach(function(key) {
      ok(key in route);
      notEqual(route[key], null);
    });
  });
});

acre.test.report();

