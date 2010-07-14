var mf = acre.require("MANIFEST").MF;
var h = acre.require("helpers");
var routes = acre.require("app_routes").routes;

/**
 * Does the given path match the given route object?
 * If so, return the target app id, target script and additional path_info.
 * Otherwise, return false.
 */
function match_route(path, route) {
  var from_re1 = RegExp("^" + route.from + "$");
  var from_re2 = RegExp("^" + route.from + "/");
  if (from_re1.test(path) || from_re2.test(path)) {
    var path_info = path.replace(route.from, "");
  }
  else {
    // no match
    return false;
  }
  var app, script, path_info;
  if (route.redirect) {
    return true;
  }
  else {
    app = mf.apps[route.to];
    if (!app) {
      throw (route.to + " must be defined in the manifest");
    }
    if (route.script) {
      script = route.script;
    }
    else {
      var [script, path_info, qs] = h.split_path(path_info);
    }
  }
  return [app, script, path_info];
};

/**
 * Invoke the error app template with status=404 and exit.
 */
function not_found(id) {
  /*
  var path = acre.form.build_url(mf.apps.error + "/index", {status:404, not_found:id});
  acre.route(path);
  acre.exit();
   */
  acre.response.status = 302;
  acre.response.set_header("location", acre.freebase.site_host + "/error" + id);
  acre.exit();
};

/**
 * Try acre.route the given path parameters.
 * Before acre.route, we do an acre.get_medata and check existence of the app and script.
 * If success, acre.route. Otherwise, not_found()
 */
function do_route(app, script, path_info, query_string) {
  try {
    var md = acre.get_metadata(app);
  }
  catch (ex) {
    return not_found(app || acre.current_script.app.id);
  }

  if (!md.files["routes"] && !md.files[script]) {
    return not_found(md.app_id + "/" + script);
  }

  var path = [
    (app ? app + "/" : ""),
    script,
    path_info,
    (query_string ? "?" + query_string : "")
  ];

  path = path.join("");
  console.log("routing", path);
  acre.route(path);
  acre.exit();
};

/**
 * Main route logic
 */
if (acre.current_script === acre.request.script) {
  var req = acre.request;
  var req_path = req.url.replace(req.app_url /*+ req.base_path*/, "");
  // filter out query string
  var path = req_path;
  var query_string;
  if (req_path.indexOf("?") !== -1) {
    var path_segs = req_path.split("?", 2);
    path = path_segs[0];
    query_string = path_segs[1];
  }

  // find the first route match
  for (var i=0,len=routes.length; i<len; i++) {
    var route = routes[i];
    var match = match_route(path, route);
    if (!match) {
      continue;
    }
    if (route.redirect) {
      acre.response.status = route.redirect;
      acre.response.set_header("location", route.to);
      acre.exit();
    }
    else {
      var app = match[0];
      var script = match[1];
      var path_info = match[2];
      // acre.route and exit
      do_route(app, script, path_info, query_string);
    }
  }
  // default to local acre.route
  var [script, path_info, query_string] = h.split_path(req_path);
  do_route(null, script, path_info, query_string);
}
