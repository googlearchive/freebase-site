/**
 *
 * routes map
 * 1. processed in order
 * 2. "to" apps for each "from" path be defined in your MANIFEST
 * 3. default route "as" "app", valid values are "app", "script"
 */
var routes = [
  {
    from: "/",
    to: "/freebase/site/homepage/index",
    as: "script"
  },
  {
    from: "/index",
    to: "/freebase/site/homepage/index",
    as: "script"
  },
  {
    from: "/domain",
    to: "/freebase/site/domain"
  },
  {
    from: "/schema",
    to: "/freebase/site/schema"
  },
  {
    from: "/toolbox",
    to: "/freebase/site/toolbox"
  },
  {
    from: "/core",
    to: "/freebase/site/core"
  },
  {
    from: "/sample",
    to: "/freebase/site/sample"
  }
];

/**
 * map: to(appid) -> route
 */
var _routes_map = {};
routes.forEach(function(route) {
  if (!route.as) {
    route.as = "app"; // default to route as "app"
  }
  var app = route.to;
  if (route.as === "script") {
    app = route.to.split("/");
    app.pop();
    app = app.join("/");
  }
  route.app = app;
  var r = _routes_map[app];
  if (!r) {
    r = _routes_map[app] = [];
  }
  r.push(route);
});


/**
 * Get the first path in routes that matches the appid.
 */
function get_route(to) {
  var r = get_routes(to);
  if (r && r.length) {
    return r[0];
  }
  return null;
};

function get_routes(to) {
  return _routes_map[to];
};
