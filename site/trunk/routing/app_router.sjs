function do_route(req, path, mf, routes) {
  var query_string;
  if (path.indexOf("?") !== -1) {
    var [path, query_string] = path.split("?", 2);
  }

  console.log("app_router", "routing", path, query_string);

  for (var i=0,len=routes.length; i<len; i++) {
    var rule = routes[i];

    if (rule.absolute) {
      if (rule.path !== path) {
        continue;
      }
    }
    else if (path.startsWith(rule.path)) {
      path = path.replace(rule.path, "");
    }
    else {
      continue;
    }

    console.log(path, rule.path, rule.app);

    if (!(rule.app in mf.version)) {
      throw (rule.app + " must be defined in the manifest");
    }

    if (!path) {
      path = "/";
      /**
       // make sure we have a path within the app we're routing too,
       // otherwise relative links will break
      var url = req.app_url + rule.path + "/";
      if (query_string) url += "?" + query_string;
      acre.response.status = 302;
      acre.response.headers.location = url;
      acre.exit();
       **/
    }

    var paths = [
      //"/routes",    // 1st option
      path//,   // 2nd option
      //"/not_found"  // 3rd option
    ];

    var extension = acre.require("extension_router");
    for (var j=0,len2=paths.length; j<len2; j++) {
      var [script_id, path_info] = extension.split_path(paths[j]);
      try {
        extension.do_route(req, rule.app + "/" + script_id, mf.version[rule.app], path_info);
        acre.exit();
      }
      catch (e if e === extension.NOT_FOUND) {
        continue;
      }
    }
  }
};

function route(req, mf, routes) {
  var path = req.url.replace(req.app_url + req.base_path, "");
  do_route(req, path, mf, routes);
}
