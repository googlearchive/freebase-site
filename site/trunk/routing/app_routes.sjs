/**
 * routes map
 * 1. processed in order
 * 2. "to" apps for each "from" path be defined in your MANIFEST
 * 3. default route "as" "app", valid values are "app", "script"
 */
var routes = [
  {
    from: "/",
    to: "homepage",
    script: "index"
  },
  {
    from: "/index",
    to: "homepage",
    script: "index"
  },
  {
    from: "/apphomepage",
    to: "homepage"
  },
  {
    from: "/appdomain",
    to: "domain"
  },
  {
    from: "/appschema",
    to: "schema"
  },
  {
    from: "/apptoolbox",
    to: "toolbox"
  },
  {
    from: "/appsample",
    to: "sample"
  },
  {
    from: "/appcore",
    to: "core"
  },
  {
    from: "/appadmin",
    to: "appadmin"
  },
  {
    from: "/approuting",
    to: "routing"
  },
  {
    from: "/apptemplate",
    to: "template"
  },
  {
    from: "/apps",
    to: "apps"
  },
  {
    from: "/appqueries",
    to: "queries"
  },
  {
    from: "/policies",
    to: "policies"
  }
];

/**
 * map[app(to)] = route
 */
var _routes_map = {};
routes.forEach(function(route) {
  var app = route.to;
  var r = _routes_map[app];
  if (!r) {
    r = _routes_map[app] = [];
  }
  r.push(route);
});


/**
 * Get the first path in routes that matches the app (id).
 */
function get_route(app) {
  var r = get_routes(app);
  if (r && r.length) {
    return r[0];
  }
  return null;
};

function get_routes(app) {
  return _routes_map[app];
};

if (acre.current_script === acre.request.script) {
  acre.require("//release.service.libs.freebase.dev/lib").GetService(function() {
    return routes;
  }, this);
}
