
function do_route(req, path, mf, routes) {
  console.log("app_router", "routing", path);

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
    }

    var paths = [
      //"/routes",    // 1st option
      path//,   // 2nd option
      //"/not_found"  // 3rd option
    ];
    
    var h = acre.require("helpers");
    var extension = acre.require("extension_router");
    for (var j=0,len2=paths.length; j<len2; j++) {
      var [script_id, path_info] = h.split_path(paths[j]);
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
  // filter out query string
  if (path.indexOf("?") !== -1) {
    var [path, query_string] = path.split("?", 2);
  }
  do_route(req, path, mf, routes);
};
