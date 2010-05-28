
var mf = acre.require("MANIFEST").MF;


/**
 *
 * routes map
 * 1. processed in order
 * 2. app handlers for each path MUST be define in routes/MANIFEST
 */
var map = [
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
  var path = req.path_info;

  map.forEach(function(r) {
    if (path.startsWith(r.path)) {
      console.log(path, r.path, r.app);

      if (! (r.app in mf.version)) {
        throw r.app + " must be defined in the routes MANIFEST";
      }

      // remove route path prefix
      path = path.replace(r.path, "");
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
        r.app + "/" + name,  // 1st option
        r.app + "/routes",       // 2nd option
        r.app + "/not_found"     // 3rd option
      ];

      res_id.every(function(id) {
        try {
          res = acre.require(id, mf.version[r.app]);
          // successfully acre.required, don't continue
          return false;
        }
        catch (ex) {
          if (ex && typeof ex === "object" && ex.message === "Could not fetch data from " + id) {
            // continue to next option
            return true;
          }
          // something else went wrong
          console.error(ex);
          throw ex;
        }
      });

      if (!res) {
        acre.response.status = 404;
        acre.exit();
      }

      if (res._main) {
        // bif of a hack to determine the thing we just acre.required is a mjt template.
        ext = "mjt";
      }
      var handler = ext_routes.handlers[ext_routes.extension_map[ext]];
      var args = [res];
      if (typeof handler === 'function') {
        handler.apply(this, args);
      }
      acre.exit();
    }
  });

};

if (acre.current_script === acre.request.script) {
  route(acre.request);
}

