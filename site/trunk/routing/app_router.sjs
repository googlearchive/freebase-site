function do_route(req, path, mf, routes) {
  var query_string;

  if (path.indexOf("?") !== -1) {
    var [path, query_string] = path.split("?", 2);
  }

  console.log("app_router", "routing", path);

  for (var i=0,len=routes.length; i<len; i++) {
    var rule = routes[i];

    if (!path.startsWith(rule.path)) {
      continue;
    }

    console.log(path, rule.path, rule.app);

    if (!(rule.app in mf.version)) {
      throw (rule.app + " must be defined in the manifest");
    }

    path = path.replace(rule.path, "");

    // make sure we have a path within the app we're routing too,
    // otherwise relative links will break
    if (!path) {
      var url = req.app_url + rule.path + "/";
      if (query_string) url += "?" + query_string;
      acre.response.status = 302;
      acre.response.headers.location = url;
      acre.exit();
    }

    var paths = [
      //"/routes",    // 1st option
      path//,   // 2nd option
      //"/not_found"  // 3rd option
    ];

    var extension = acre.require("extension_router");
    for (var j=0,len2=paths.length; j<len2; j++) {
      try {
        extension.do_route(req, paths[j], rule.app, mf.version[rule.app]);
        acre.exit();
      }
      catch (ex) {
        if (ex === extension.NOT_FOUND) {
          continue;
        }
        throw(ex);
      }
    }
  }
};

function route(req, mf, routes) {
  var path = req.url.replace(req.app_url + req.base_path, "");
  do_route(req, path, mf, routes);
}
