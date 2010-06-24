
acre.require('/test/lib').enable(this);

var routes = acre.require("app_routes").routes;

test("routes", function() {
  var keys = ["from", "to"];
  routes.forEach(function(route) {
    keys.forEach(function(key) {
      ok(key in route);
      notEqual(route[key], null);
      if (key === "from") {
        equal(route[key].indexOf("/"), 0);
      }
    });
  });
});

acre.test.report();

