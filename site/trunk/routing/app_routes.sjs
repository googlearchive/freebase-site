/**
 *
 * routes map
 * 1. processed in order
 * 2. app handlers for each path MUST be define in your MANIFEST
 */
var routes = [
  {
    path: "/",
    app: "/freebase/site/homepage",
    absolute: true
  },
  {
    path: "/index",
    app: "/freebase/site/homepage",
    absolute: true
  },
  {
    path: "/domain",
    app: "/freebase/site/domain"
  },
  {
    path: "/schema",
    app: "/freebase/site/schema"
  },
  {
    path: "/toolbox",
    app: "/freebase/site/toolbox"
  },
  {
    path: "/core",
    app: "/freebase/site/core"
  },
  {
    path: "/sample",
    app: "/freebase/site/sample"
  }
];

/**
 * map: appid -> route
 */
var _app_paths = {};
for (var i=0,l=routes.length; i<l; i++) {
  var r = _app_paths[routes[i].app];
  if (!r) {
    r = _app_paths[routes[i].app] = [];
  }
  r.push(routes[i]);
};

/**
 * Get the first path in routes that matches the appid.
 */
function get_route(appid) {
  var r = get_routes(appid);
  if (r && r.length) {
    return r[0];
  }
  return null;
};

function get_routes(appid) {
  return _app_paths[appid];
};
