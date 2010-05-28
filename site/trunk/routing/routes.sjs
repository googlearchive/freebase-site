
var mf = acre.require("MANIFEST").MF;


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


/**
 * Extension routes library know how to handle mjt, mql, sjs, and static files
 */
var ext_routes = acre.require("extension_routes");

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
      throw rule.app + " must be defined in the routes MANIFEST";
    }

    // remove route path prefix
    path = path.replace(rule.path, "");
    var path_info = path.split("/");
    path_info.shift();

    // file/script name is the first part of the path
    var name = path_info.shift() || "index";

    // monkey patch acre.request.path_info minus the file/script name
    req.path_info = "/" + path_info.join("/");

    // file ext determines how it's going to be served
    var ext = name.split(".");
    ext = ext.length ? ext.pop() : null;

    var res, res_id = [
      rule.app + "/routes",       // 1st option
      rule.app + "/" + name,      // 2nd option
      rule.app + "/not_found"     // 3rd option
    ];

    for (var j=0,len2=res_id.length; j<len2; j++) {
      var id = res_id[j];
      try {
        res = acre.require(id, mf.version[rule.app]);
        break;
      }
      catch (e) {
        if (e && typeof e === "object" && e.message === "Could not fetch data from " + id) {
          // continue to next option
          continue;
        }
        else {
          console.error(e);
          throw ""+e;
        }
      }
    }

    if (!res) {
      acre.response.status = 404;
      acre.exit();
    }

    if (res._main) {
      // bit of a hack to determine the thing we just acre.required is a mjt template.
      ext = "mjt";
    }
    var handler = ext_routes.handlers[ext_routes.extension_map[ext]];
    var args = [res];
    if (typeof handler === 'function') {
      handler.apply(this, args);
    }
    acre.exit();
  }
};

if (acre.current_script === acre.request.script) {
  route(acre.request);

  console.log("extension routes", acre.request);
  ext_routes.route(acre.request);
}

