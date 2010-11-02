/**
 * routes map
 * 1. processed in order
 * 2. "to" apps for each "from" path be defined in your MANIFEST
 * 3. default route "as" "app", valid values are "app", "script"
 */
var routes = [
  {from: "/",                  to: "homepage", script: "index"},
  {from: "/index",             to: "homepage", script: "index"},
  {from: "/home",              to: "homepage", script: "home"},
  {from: "/homepage",          to: "homepage"},
  {from: "/schema",            to: "schema"},
  {from: "/domain",            to: "domain"},
  {from: "/toolbox",           to: "toolbox"},
  {from: "/sample",            to: "sample"},
  {from: "/core",              to: "core"},
  {from: "/app/admin",         to: "appadmin"},
  {from: "/routing",           to: "routing" },
  {from: "/template",          to: "template"},
  {from: "/apps",              to: "apps"},
  {from: "/queries",           to: "queries"},
  {from: "/docs",              to: "devdocs"},
  {from: "/policies",          to: "policies"},
  {from: "/tasks",             to: "tasks"},
  {from: "/developer",         to: "http://wiki.freebase.com/wiki/Developers", redirect: 301},
  {from: "/permission",        to: "permission"},
  {from: "/appeditor",         to: "appeditor"},
  {from: "/jqueryui",          to: "jqueryui"},
  {from: "/validator",         to: "validator"},
  {from: "/i18n",              to: "i18n"},
  {from: "/about",             to: "about"},
  {from: "/labs/cubed",        to: "cubed"},
  {from: "/labs/parallax",     to: "parallax"},
  {from: "/labs",              to: "labs"},
  {from: "/queryeditor",       to: "queryeditor"},
  {from: "/app/queryeditor",   to: "/queryeditor", redirect: 301},
  {from: "/tools/queryeditor", to: "/queryeditor", redirect: 301},
  {from: "/app/tmt",           to: "tmt"},
  {from: "/inspect",           to: "triples"},
  {from: "/tools/explore",     to: "/inspect", redirect: 301},
  {from: "/tools/explore2",    to: "/inspect", redirect: 301} // old explore2 just uses the new triples
];

/**
 * map[app(to)] = route
 */
var _routes_map = {};
var _routes_path = {};
routes.forEach(function(route) {
  var path = route.from;
  var app = route.to;
  var r = _routes_map[app];
  if (!r) {
    r = _routes_map[app] = [];
  }
  r.push(route);
  var p = _routes_path[path];
  if (!p) {
    p = _routes_path[path] = [];
  }
  p.push(route);
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

function get_route_by_path(path) {
  var r = get_routes_by_path(path);
  if (r && r.length) {
    return r[0];
  }
  return null;
};

function get_routes_by_path(path) {
  return _routes_path[path];
};

if (acre.current_script === acre.request.script) {
  acre.require("//release.service.libs.freebase.dev/lib").GetService(function() {
    return routes;
  }, this);
}
