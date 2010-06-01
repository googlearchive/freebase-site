/**
 *
 * routes map
 * 1. processed in order
 * 2. app handlers for each path MUST be define in routes/MANIFEST
 */
var routes = [
  {
    path: "/core",
    app: "/freebase/site/core"
  },
  {
    path: "/bar/foo",
    app: "/freebase/site/sample"
  },
  {
    path: "/foo/bar",
    app: "/freebase/site/domain"
  },
  {
    path: "/foo",
    app: "/freebase/site/sample"
  },
  {
    path: "/bar",
    app: "/freebase/site/domain"
  },
  {
    path: "/schema",
    app: "/freebase/site/schema"
  }
];


if (acre.current_script === acre.request.script) {
  var mf = acre.require("MANIFEST").MF;

  // 1. Try ajax routing (i.e, any requests that start with /ajax)
  //var ajax = acre.require("ajax_routing");
  //ajax.route(acre.request, mf, routes);

  // 2. Try app routing rules as defined by app routing map
  var app = acre.require("app_routing");
  app.route(acre.request, mf, routes);

  // 3. Fallback to default acre local routing by extensions/filename
  var extension = acre.require("extension_routing");
  extension.route(acre.request);
}

