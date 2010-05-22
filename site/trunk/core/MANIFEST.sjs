/**
 * TODO: this should go in some library
 *
 * @see jQuery.extend()
 */
function extend() {
  var a = arguments[0];
  for (var i=1,len=arguments.length; i<len; i++) {
    var b = arguments[i];
    for (var prop in b) {
      a[prop] = b[prop];
    }
  }
  return a;
};

/**
 * usage:
 *   var MF = {...};
 *   acre.require("/freebase/site/core/MANIFEST").init(MF, this);
 */
function init(MF, scope) {
  extend_manifest(MF, scope);
  if (scope.acre.current_script == scope.acre.request.script) {
    MF.main();
  }
};

/**
 * All apps' MANIFEST.MF must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.MF as json/p
 */
function extend_manifest(MF, scope) {
  var orig = extend({}, MF);
  return extend(MF, base_manifest(MF, scope), orig);
};

/**
 * The base MANIFEST core library.
 */
function base_manifest(MF, scope) {
  var base = {
    /**
     * The base url prefix for retrieving css and js. All apps who extend the base_manifest
     * will have a "/MANIFEST/s" entry-point to serve css and js as specified in their MF.stylesheet
     * and MF.javascript.
     *
     * The idea is that once an app is branched/deployed, this static_base_url will be changed
     * to a permanent static server (i.e., http://freebaselibs.com/statc/freebase_site/foo/[version]/...).
     * But when developing, we want the resources to be served dynamically through "/MANIFEST/s/...".
     */
    static_base_url: scope.acre.current_script.app.base_url + scope.acre.request.base_path + "/MANIFEST/s/",

    /**
     * Generate the proper url to serve the css(s) specified by "foo.css" key in MF.stylesheet
     *
     * usage:
     *   <link rel="stylesheet" type="text/css" href="${MF.link_href("foo.css")}"/>
     */
    link_href: function(key) {
      return MF.static_base_url + key;
    },

    /**
     * Generate the proper url to serve the js(s) specified by "foo.js" key in MF.javascript
     *
     * usage:
     *   <script type="text/javascript" src="${MF.script_src("foo.js")}"></script>
     */
    script_src: function(key) {
      return MF.static_base_url + key;
    },


    /**
     * TODO: fix
     */
    img_src: function(resource_id) {
      var appid = resource_id.split("/");
      if (appid.length === 1) {
        return scope.acre.current_script.app.base_url + "/" + resource_id;
      }
      return resource_id;
    },

    /**
     * less (css) parser.
     */
    less: function(data /*required*/, callback /*required*/, errback /*optional*/) {
      if (!MF.less.parser) {
        MF.less.parser = new(scope.acre.require("/freebase/site/core/less", MF.version["/freebase/site/core"]).less.Parser)({optimization:3});
      }
      MF.less.parser.parse(data, function(e, root) {
        if (e) {
          if (errback) {
            errback(e);
          }
        }
        else {
          callback(root.toCSS());
        }
      });
    },

    /**
     * Serve (acre.write) all css declared in MF.stylesheet[key].
     * If css is less (*.less), then run the less parser.
     *
     * TODO: we need to post-process (regex) to replace url(...) declarations.
     */
    css: function(key) {
      if (! (MF.stylesheet && (key in MF.stylesheet))) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/css");
      MF.stylesheet[key].forEach(function(id) {
        var source;
        try {
          source = scope.acre.require(id, MF.resource_version(id)).body;
        }
        catch (ex) {
          scope.acre.write("\n/** " + ex.toString() + " **/\n");
          return;
        }
        if (/\.less$/.exec(id)) {
          MF.less(source, scope.acre.write, function(e) {
            scope.acre.write(scope.JSON.stringify(e, null, 2));
          });
        }
        else {
          scope.acre.write(source);
        }

        // process all css replacing url(/foo/app/bar.png) declarations
      });
    },

    /**
     * Serve (acre.write) all js declared in MF.javascript[key].
     */
    js: function(key) {
      if (! (MF.javascript && (key in MF.javascript))) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/javascript");
      MF.javascript[key].forEach(function(id) {
        var source;
        try {
          source = scope.acre.require(id, MF.resource_version(id)).body;
        }
        catch (ex) {
          scope.acre.write("\n/** " + ex.toString() + " **/\n");
          return;
        }
        scope.acre.write(source);
      });
    },

    /**
     * Match resource_id to an app version declared in MF.version
     * If resource_id is unrecognized (i.e., app_id not declared in MF.version),
     * throws error.
     */
    resource_version: function(resource_id) {
      var appid = resource_id.split("/");
      if (appid.length === 1) {
        return null;
      }
      appid.pop();
      appid = appid.join("/");
      if (MF.version && (appid in MF.version)) {
        return MF.version[appid];
      }
      throw "A version for " + appid + " must be declared in the MANIFEST.";
    },

    /**
     * The "/MANIFEST/s" handler. Currently only recognizes *.js and *.css.
     */
    s: function(key) {
      if (/\.js$/.exec(key)) {
        MF.js(key);
      }
      else if (/\.css$/.exec(key)) {
        MF.css(key);
      }
      else {
        MF.not_found();
      }
    },

    not_found: function() {
      scope.acre.response.status = 404;
      scope.acre.exit();
    },

    /**
     * Main block. DO NOT MODIFY!
     *
     * Responsible for routing request to "/MANIFEST/s" or serve MF (json/p).
     *
     * usage:
     *   var MF = {...};
     *   acre.require("/freebase/site/core/MANIFEST").extend_manifest(MF, this);
     *   if (acre.current_script == acre.request.script) {
     *     MF.main();
     *   };
     */
    main: function() {
      if (scope.acre.request.path_info && scope.acre.request.path_info.length) {
        var path = scope.acre.request.path_info.substring(1).split("/", 2);
        if (path.length === 2) {
          if (typeof MF[path[0]] === "function") {
            return MF[path[0]](path[1]);
          }
        }
        if (scope.acre.request.path_info !== "/") {
          return MF.not_found();
        }
      }
      var service = scope.acre.require("/freebase/libs/service/lib", "release");
      return service.GetService(function() {
        return MF;
      }, scope);
    }
  };


  /**
   * DO NOT MODIFY!
   *
   * The url specified in static_base_url.txt (if it exists) overrides default base.static_base_url.
   * We use this to use freebaselibs to serve static files (js, css, png, etc.)
   *
   * static_base_url.txt is updated by freebase site branch/deploy scripts.
   */
  try {
    base.static_base_url = scope.acre.require("static_base_url.txt").body.replace(/^\s+|\s+$/g, "");
  }
  catch(ex) {
    // ignore
  }

  return base;
};


var MF = {
  "version": {
    "/freebase/libs/jquery": "release"
  },
  "suggest" : {
    "version": "1.2.1",
    "base_url": "http://freebaselibs.com/static/suggest/"
  },
  "jquery" : {
    "version" : "1.4"
  },
  "freebase": {
      "resource": {
        "hash": "69ebf557e8734e6575f5077fe4e03506c99a28c5bb34e101459906ac6f44992f",
        "base_url": "http://res.freebase.com/s/"
      }
  },
  "stylesheet": {
    "core.css": ["core.css"]
  },
  "javascript": {
    "core.js": ["signin.js", "searchbox.js", "core.js"]
  }
};
MF.suggest.base_url += MF.suggest.version;
MF.freebase.resource.base_url += MF.freebase.resource.hash;
init(MF, this);
