
if (acre.current_script === acre.request.script) {
  var router, routes;
  var mf = acre.require("MANIFEST").MF;

  // 1. Try ajax routing (i.e, any requests that start with /ajax)
  // router = acre.require("ajax_router");
  // routes = acre.require("ajax_routes");
  // router.route(acre.request, mf, routes);

  // 2. Try app routing rules as defined by app routing map
  router = acre.require("app_router");
  routes = acre.require("app_routes").routes;
  router.route(acre.request, mf, routes);

  // 3. Fallback to default acre local routing by extensions/filename
  router = acre.require("extension_router");
  try {
    router.route(acre.request);
  }
  catch (ex) {
    if (ex === router.NOT_FOUND) {
      acre.response.status = 404;
      acre.write("not_found"); 
      acre.exit();
    }
    throw(ex);
  }
}

