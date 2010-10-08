var mf = acre.require("MANIFEST").mf;
var h = mf.require("helpers");
var rules = mf.require("app_routes").rules;

/**
 * Invoke the error app template with status=404 and exit.
 */
function not_found(id) {
  var path = acre.form.build_url(mf.apps.error + "/index", {status:404, not_found:id});
  acre.route(path);
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
  return acre.exit();
};

//check if the top level domain does not start with www.
//issue a 301 to the same url, starting with www.
//cache the response
function check_top_level_domain() {
  var req = acre.request;
  var must_redirect = ['freebase.com', 'sandbox-freebase.com'];
  
  for (var i in must_redirect) {
    if (req.url.slice(7).indexOf(must_redirect[i]) == 0) {
      var new_url = 'http://www.' + req.url.slice(7);
      acre.response.status = '301';
      acre.response.set_header("Location", new_url);
      acre.response.set_header("cache-control", "public, max-age: 3600");
      acre.exit();
    }
  }
};

/**
 * Main route logic
 */
if (acre.current_script === acre.request.script) {
  check_top_level_domain();
  
  var req = acre.request;
  var req_path = req.url.replace(req.app_url, "");
  // filter out query string
  var path = req_path;
  var query_string;
  if (req_path.indexOf("?") !== -1) {
    var path_segs = req_path.split("?", 2);
    path = path_segs[0];
    query_string = path_segs[1];
  }
  
  var route = rules.route_for_path(path);
  if (route) {
    if (route.redirect && route.url) {
      // Handle both absolute and relative redirects
      acre.response.status = route.redirect;
      var redirect_url;
      if (/^https?:\/\//.test(route.url)) {
        redirect_url = route.url;
      } else {
        redirect_url = req.app_url + req_path.replace(route.prefix, route.url);
      }
      acre.response.set_header("location", redirect_url);
      acre.exit();
      
    } else if (route.app) {
      // Handle canonical app routing
      var app = mf.apps[route.app];
      if (!app) {
 	    throw (route.app + " must be defined in the MANIFEST for routing.");
 	  } 
      var script = route.script;
      var path_info = path.replace(route.prefix, '');
      
      if (!script) {
        var [script, path_info, qs] = h.split_path(path_info);
      }
      
      // acre.route and exit
      do_route(app, script, path_info, query_string);
    }
  } else {
    // default to local acre.route
    var [script, path_info, query_string] = h.split_path(req_path);
    do_route(null, script, path_info, query_string);
  }

  throw 'Invalid route: '+route;
}
