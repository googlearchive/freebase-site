
function do_route(req, path, mf, routes) {
  console.log("app_router", "routing", path);

  for (var i=0,len=routes.length; i<len; i++) {
    var rule = routes[i];
    var app = rule.app;

    if (rule.as === "script") {
      if (rule.from !== path) {
        continue;
      }
    }
    else if (path.startsWith(rule.from)) {
      path = path.replace(rule.from, "");
    }
    else {
      continue;
    }

    console.log(path, rule.from, rule.to, rule.as);

    if (!(app in mf.version)) {
      throw (app + " must be defined in the manifest");
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
        extension.do_route(req, app + "/" + script_id, mf.version[app], path_info);
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
