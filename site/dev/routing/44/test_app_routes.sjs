acre.require('/test/lib').enable(this);

test("rules", function() {
  var rules = acre.require("app_routes").rules;
  ok(rules, 'Make sure that routes are valid by loading rules');
  
  rules.all_routes().forEach(function(route) {
    ok(route.prefix, 'Each route must have a prefix');
    equal(route.prefix.indexOf("/"), 0, 'Each prefix must begin with a /');
    ok(route.app || (route.url && route.redirect), 'Each route must be either an app or redirect');
  });
});

test("userfacing_apps", function() {
  var rules = acre.require("app_routes").rules;

  ok(rules.route_for_path('/'), 'Route for the logged-out homepage');
  ok(rules.route_for_path('/home'), 'Route for the logged-in homepage');
  ok(rules.route_for_path('/schema/people/person'), 'Route for schema type page');
  ok(rules.route_for_path('/apps'), 'Route for apps');

  ok(rules.route_for_app('homepage', 'index'), 'Url for the logged-out homepage');
  ok(rules.route_for_app('homepage', 'home'), 'Url for the logged-in homepage');
  ok(rules.route_for_app('schema'), 'Url for schema');
  ok(rules.route_for_app('apps'), 'Url for apps');
});

test("redirects", function() {
  var rules = acre.require("app_routes").rules;
  
  ok(rules.route_for_path('/tools/explore'), 'Redirect for old explore page');
  ok(rules.route_for_path('/developer'), 'Redirect for developer wiki page');
});

test("all_rules", function() {
  var rules = acre.require("app_routes").rules;
  rules.all_routes().forEach(function(route) {
    var path = route.prefix + "/foo/bar/baz";
    var path_route = rules.route_for_path(path);
    equals(path_route, route);
    
    if (route.redirect) {
      ok(route.url, 'Each redirect must have a url:'+route.url);

      /*
        Can't do this check now because some urls are still handled
           by the client, so it's not actually finding duplicate redirects, just
           a redirect to a client url
           
      if (!(/https?\:\/\//.test(route.url))) {
        var redirect_route = rules.route_for_path(route.url);
        // if this route is handled by acre make sure that
        //   it itself is not another redirect
        if (redirect_route) {
          ok(!redirect_route.redirect, 'Not another redirect: '+route);
        }
      }*/
      
      ok(route.redirect > 300, 'Redirect code greater then 300');
      ok(route.redirect < 400, 'Redirect code less than 400');
      
    }
  });
});


acre.test.report();