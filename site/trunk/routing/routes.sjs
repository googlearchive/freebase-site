var mf = acre.require("MANIFEST").MF;
var h = acre.require("helpers");
var routes = acre.require("app_routes").routes;

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
  if (route.script) {
    var script = route.script;
  }
  else {
    var [script, path_info, qs] = h.split_path(path_info);
  }
  var app = mf.apps[route.to];
  if (!app) {
    throw (route.to + " must be defined in the manifest");
  }
  return [app, script, path_info];
};

function not_found(id) {
  mf.require("error", "index").main(this, {status:404, not_found:id});
  acre.exit();
};

function do_route(app, script, path_info, query_string) {
  try {
    var md = acre.get_metadata(app);
  }
  catch (ex) {
    return not_found(app || acre.current_script.app.id);
  }
  if (!md.files[script]) {
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
    var app = match[0];
    var script = match[1];
    var path_info = match[2];
    // acre.route and exit
    do_route(app, script, path_info, query_string);
  }
  // default to local acre.route
  var [script, path_info, query_string] = h.split_path(req_path);
  do_route(null, script, path_info, query_string);
}
