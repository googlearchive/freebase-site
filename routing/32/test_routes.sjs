
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
      if (/https?\:\/\//.test(route.to)) {
        ok(route.to, route.to);
      }
      else {
        var r = routes.get_route_by_path(route.to);
        ok(r, JSON.stringify(r));
        ok(!r.redirect, r.redirect);  // redirected path cannot be another redirect
        deepEqual(r, routes.get_route(r.to), r.to);
      }
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

