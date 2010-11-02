
acre.require('/test/lib').enable(this);

var router = acre.require("routes");
var routes = acre.require("app_routes");
var mf = acre.require("MANIFEST").mf;

test("match_route", function() {

  routes.routes.forEach(function(route) {
    var path = route.from + "/foo/bar/baz";
    var m = router.match_route(path, route);
    ok(m, path);
    if (route.redirect) {
      ok(/https?\:\/\//.test(route.to), route.to);
      ok(route.redirect > 300, ""+route.redirect);
      ok(route.redirect < 400, ""+route.redirect);
    }
    else if (route.script) {
      equal(m[0], mf.apps[route.to]);
      equal(m[1], route.script);
      equal(m[2], "/foo/bar/baz");
    }
    else {
      equal(m[0], mf.apps[route.to]);
      equal(m[1], "foo");
      equal(m[2], "/bar/baz");
    }
  });
});

acre.test.report();

