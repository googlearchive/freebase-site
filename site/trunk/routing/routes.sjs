var mf = acre.require("MANIFEST").MF;
var h = acre.require("helpers_routes");

/**
 *
 * routes map
 * 1. processed in order
 * 2. app handlers for each path MUST be define in routes/MANIFEST
 */
var map = [
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
    path: "/hello",
    app: "/freebase/site/hello"
  }
];


function route(req) {
  var path = req.url.replace(req.app_url + req.base_path, "");

  console.log("routing", path);

  for (var i=0,len=map.length; i<len; i++) {
    var rule = map[i];

    if (!path.startsWith(rule.path)) {
      continue;
    }

    console.log(path, rule.path, rule.app);

    if (!(rule.app in mf.version)) {
      throw (rule.app + " must be defined in the routes MANIFEST");
    }

    path = path.replace(rule.path, "");

    var paths = [
      "/routes",    // 1st option
      "/" + path,   // 2nd option
      "/not_found"  // 3rd option
    ];

    for (var j=0,len2=paths.length; j<len2; j++) {
      try {
        h.do_route(req, paths[j], rule.app, mf.version[rule.app]);
        acre.exit();
      }
      catch (ex) {
        if (ex === h.ERROR_NOT_FOUND) {
          continue;
        }
        throw(ex);
      }
    }
  }
};

if (acre.current_script === acre.request.script) {
  route(acre.request);
  console.log("extension routes", acre.request);
  h.route(acre.request);
}

