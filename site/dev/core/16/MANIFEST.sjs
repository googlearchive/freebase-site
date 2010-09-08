var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.freebase.resource.base_url += mf.freebase.resource.hash;
var core_mf = mf;

var extend = acre.require("helpers_util").extend;
var freebase_static_resource_url;


/**
 * All apps' MANIFEST.mf must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.mf as json/p
 *
 * usage:
 *   var mf = JSON.parse(acre.require("CONFIG.json").body);
 *   acre.require(mf.apps.core).init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/core/d41d8cd98f00b204e9800998ecf8427e", "static_base_url": "http://freebaselibs.com/static/freebase_site/core/d41d8cd98f00b204e9800998ecf8427e"});
 */
function init(app_mf, scope, options) {
  var original = extend({}, app_mf, options);
  var apps = app_mf.apps;
  delete original.apps;
  
  extend(app_mf, base_manifest(app_mf, scope), original);
  extend(app_mf.apps, apps);
  
  if (scope.acre.current_script === scope.acre.request.script) {
    app_mf.main();
  }
}

function  get_app_base_url(scope) {
  if (/^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(scope.acre.request.app_url)) {
    var routes_mf = acre.require(core_mf.apps.routing + "/MANIFEST");
    var app = routes_mf.get_app(scope.acre.current_script.app.path);
    if (app) {
      var routes = acre.require(core_mf.apps.routing + "/app_routes");
      var rts = routes.get_routes(app);
      if (rts) {
        for (var i=0,l=rts.length; i<l; i++) {
          var rt = rts[i];
          if (!rt.script) {
            return scope.acre.request.app_url + rt.from;
          }
        }
      }
    }
  }
  return scope.acre.current_script.app.base_url;
};


/**
 * The base MANIFEST core library.
 */
function base_manifest(app_mf, scope) {
  var base = {
    /**
     * mf.apps, mf.stylesheet, mf.javascript default to empty dictionary
     */
    apps: extend({}, core_mf.apps),
    stylesheet: {},
    javascript: {},

    get_app_base_url: function() {
      if (/^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(scope.acre.request.app_url)) {
        var routes_mf = acre.require(core_mf.apps.routing + "/MANIFEST");
        var app = routes_mf.get_app(scope.acre.current_script.app.path);
        if (app) {
          var routes = acre.require(core_mf.apps.routing + "/app_routes");
          var rts = routes.get_routes(app);
          if (rts) {
            for (var i=0,l=rts.length; i<l; i++) {
              var rt = rts[i];
              if (!rt.script) {
                return scope.acre.request.app_url + rt.from;
              }
            }
          }
        }
      }
      return scope.acre.current_script.app.base_url;
    },

    /**
     * The base url prefix for retrieving css and js. All apps who extend the base_manifest
     * will have a "/MANIFEST/..." entry-point to serve css and js as specified in their mf.stylesheet
     * and mf.javascript.
     *
     * The idea is that once an app is branched/deployed, this static_base_url will be changed
     * to a permanent static server (i.e., http://freebaselibs.com/statc/freebase_site/foo/[version]/...).
     * But when developing, we want the resources to be served dynamically through "/MANIFEST/...".
     *
     */
    static_base_url: null,

    /**
     * This is like static_base_url but for images (*.png, *.gif, etc.).
     *
     */
    image_base_url: null,

    app_base_url: null,

    /**
     * Generate the proper url to serve the css resource(s) specified by mf.stylesheet[key].
     * mf.stylesheet[key] value must be an array of strings (local file) and/or tuples defining
     * the app label, file and any additional parameters.
     *
     * var mf = {
     *   ...
     *   stylesheet: {
     *     "my.mf.css": [
     *       "local.css",    // local css
     *       ["external_app_label", "external.less"],  // external css
     *       ["external_app_label", "external.mf.css"]  // external manifest css
     *     ],
     *   ...
     *   }
     * }
     * For the tuple declarations, you MUST specify the app label in mf.apps.
     *
     * usage:
     *   <link rel="stylesheet" type="text/css" href="${mf.css_src("my.mf.css")}"/>
     */
    css_src: function(key) {
      return app_mf.static_base_url + "/" + key;
    },


    /**
     * Generate the proper url to serve the js resource(s) specified by mf.javascript[key].
     * mf.javascript[key] value must be an array of strings (local file) and/or tuples defining
     * the app label, file and any additional parameters.
     * var mf = {
     *   ...
     *   javascript: {
     *     "my.mf.js": [
     *       "local.js",    // local js
     *       ["external_app_label", "external.js"],  // external js
     *       ["external_app_label", "external.mf.js"]  // external manifest js
     *     ],
     *   ...
     *   }
     * }
     * For the tuple declarations, you MUST specify the app label in mf.apps.
     *
     * usage:
     *   <script type="text/javascript" src="${mf.js_src("my.mf.js")}"></script>
     */
    js_src: function(key) {
      return app_mf.static_base_url + "/" + key;
    },

    /**
     * Helper method to parse app label, file arguments.
     * If one argument, first argument is the file name of the local resource.
     * If two arguments, first argument is the app label (defined in mf.apps) and second is the file name.
     */
    require_args: function(app, file) {
      var args = [arg for each (arg in [app, file]) if (arg)];
      if (!args.length) {
        throw("bad require args");
      }
      if (args.length > 1) {
        return {app:args[0], file:args[1], local:false};
      }
      else {
        return {app:null, file:args[0], local:true};
      }
    },

    /**
     * Generate the proper url to serve an image resource.
     * If one argument, first argument is the local image resource.
     * If two arguments, first argument is the app label and second is the file name.
     *
     * usage:
     *   <img src="${mf.img_src('local.png')}" /><!-- local image -->
     *   <img src="${mf.img_src('some_app_label', 'external.png')}" /><!-- external image -->
     */
    img_src: function(app, file) {
      var args = app_mf.require_args(app, file);
      if (args.local) {
        // local image files relative to the current app
        return app_mf.image_base_url + "/" + args.file;
      }
      else {
        // get the url through the external app MANIFEST.mf.img_src(resource.name)
        var ext_mf = app_mf.require(args.app, "MANIFEST").mf;
        return ext_mf.img_src(args.file);
      }
    },

    /**
     * less (css) parser.
     */
    less: function(data /*required*/, callback /*required*/, errback /*optional*/) {
      if (!app_mf.less.parser) {
          app_mf.less.parser = new(app_mf.require("core", "less").less.Parser)({optimization:3});
      }
      app_mf.less.parser.parse(data, function(e, root) {
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
     * Serve (acre.write) all css declared in mf.stylesheet[key].
     * Run the less css parser on all of the css afterwards
     */
    css: function(key, scope, buffer, use_acre_url) {
      var mf_ss = app_mf.stylesheet[key];
      if (! mf_ss) {
        return app_mf.not_found(scope.acre.current_script.app.id + "/MANIFEST/" + key);
      }
      scope.acre.response.set_header("content-type", "text/css");
      var buf = [];
      for (var i=0,l=mf_ss.length; i<l; i++) {
        var ss = mf_ss[i];
        if (!(ss instanceof Array)) {
          ss = [ss];
        }
        if (ss.length === 2) {
          buf.push("\n/** " + ss[0] + ", " + ss[1] + "**/\n");
          var ext_md = app_mf.get_metadata(ss[0]);
          if ("MANIFEST" in ext_md.files) {
            // Go through external app's mf
            var ext_mf = app_mf.require(ss[0], "MANIFEST").mf;
            if (ss[1] in ext_mf.stylesheet) {
              // Go through external app's mf.css() if ss[1] is in external app's mf.stylesheet
              buf = buf.concat(ext_mf.css(ss[1], scope, true, use_acre_url));
            }
            else {
              // Otherwise, use external app's mf.css_preprocessor on the contents
              // of the external app's file
              try {
                buf.push(ext_mf.css_preprocessor(ext_mf.require(ss[1]).body, use_acre_url));
              }
              catch (ex) {
                scope.acre.write("\n/** " + ex.toString() + " **/\n");
                acre.exit();
              }
            }
          }
          else {
            // If no external app MANIFEST then just include the contents
            // of the external file
            try {
              buf.push(app_mf.require(ss[0], ss[1]).body);
            }
            catch (ex) {
              scope.acre.write("\n/** " + ex.toString() + " **/\n");
              acre.exit();
            }
          }
        }
        else if (ss.length === 1) {
          buf.push("\n/** " + ss[0] + "**/\n");
          if (ss[0] in app_mf.stylesheet) {
            // you can chain mf.stylesheet declarations
            // WARNING! DOES NOT CHECK FOR CIRCULAR DEPENDENCIES!!!
            buf = buf.concat(app_mf.css(ss[0], scope, true, use_acre_url));
          }
          else {
            try {
              // css preprocessor to replace url(...) declarations
              buf.push(app_mf.css_preprocessor(app_mf.require(ss[0]).body, use_acre_url));
            }
            catch (ex) {
              scope.acre.write("\n/** Processing file '" + ss[0] + "' - " + ex.toString() + ". **/\n");
              acre.exit();
            }
          }
        }
      }

      // mf.stylesheet[key].forEach(function(ss) {
      //   if (!(ss instanceof Array)) {
      //     ss = [ss];
      //   }
      //   if (ss.length > 1) {
      //     var ext_mf = mf.require(ss[0], "MANIFEST").mf;
      //     if (ss.length === 2) {
      //       // run css_preprocessor within the context of ext_mf
      //       buf.push(ext_mf.css_preprocessor(ext_mf.require(ss[1]).body, use_acre_url));
      //     }
      //     else if (ss.length === 3 && ss[1] === "MANIFEST") {
      //       // get external css manifest content within the context of ext_mf
      //       var f = ss[2].split("/", 2).pop();
      //       buf = buf.concat(ext_mf.css(f, scope, true, use_acre_url));
      //     }
      //   }
      //   else {
      //     try {
      //       // css preprocessor to replace url(...) declarations
      //       buf.push(mf.css_preprocessor(mf.require.apply(null, ss).body, use_acre_url));
      //     }
      //     catch (ex) {
      //       scope.acre.write("\n/** " + ex.toString() + " **/\n");
      //       acre.exit();
      //     }
      //   }
      // });

      if (buffer) {
        return buf;
      }

      // run less on concatenated css/less
      app_mf.less(buf.join(""),
              scope.acre.write,
              function(e) {
                scope.acre.write(scope.JSON.stringify(e, null, 2));
              });
    },

    css_preprocessor: function(str, use_acre_url) {
      if (!freebase_static_resource_url) {
        freebase_static_resource_url = app_mf.require("core", "helpers_url").freebase_static_resource_url;
      }
      var buf = [];
      var m, regex = /url\s*\(\s*([^\)]+)\s*\)/gi;
      str.split(/[\n\r\f]/).forEach(function(l) {
        buf.push(l.replace(regex, function(m, group) {
          var url = group.replace(/^\s+|\s+$/g, "");
          if (url.indexOf("http://") == 0 || url.indexOf("https://") === 0) {
            return m;
          }
          else if (url.indexOf("static://") === 0) {
            return "url(" + freebase_static_resource_url(url.substring(9)) + ")";
          }
          else {
            var params = [];
            if (url.indexOf(",") === -1) {
              params.push(url);
            }
            else {
              var [app, file] = url.split(",", 2);
              params.push(app.replace(/^\s+|\s+$/g, ""));
              params.push(file.replace(/^\s+|\s+$/g, ""));
            }

            if (use_acre_url) {
              var args = app_mf.require_args.apply(null, params);
              var app_path = args.local ? scope.acre.current_script.app.path : app_mf.apps[args.app];
              return "url(" + app_path + "/" + args.file + ")";
            }
            else {
              return "url(" + app_mf.img_src.apply(null, params).replace(/\s/g, '%20') + ")";
            }
          }
        }));
      });
      return buf.join("\n");
    },

    /**
     * Serve (acre.write) all js declared in mf.javascript[key].
     */
    js: function(key, scope) {
      var mf_script = app_mf.javascript[key];
      if (!mf_script) {
        return app_mf.not_found(scope.acre.current_script.app.id + "/MANIFEST/" + key);
      }
      scope.acre.response.set_header("content-type", "text/javascript");
      for (var i=0,l=mf_script.length; i<l; i++) {
        var script = mf_script[i];
        if (!(script instanceof Array)) {
          script = [script];
        }
        if (script.length === 2) {
          scope.acre.write("\n/** " + script[0] + ", " + script[1] + " **/\n");
          var ext_md = app_mf.get_metadata(script[0]);
          if ("MANIFEST" in ext_md.files) {
            // Go through external app's mf
            // for further mf.js chaining if script[1] in external app's mf.javascript.
            var ext_mf = app_mf.require(script[0], "MANIFEST").mf;
            if (script[1] in ext_mf.javascript) {
              ext_mf.js(script[1], scope);
              continue;
            }
          }
          // otherwise, just mf.require the contents of the external app's file
          try {
            scope.acre.write(app_mf.require(script[0], script[1]).body);
          }
          catch (ex) {
            scope.acre.write("\n/** " + ex.toString() + " **/\n");
          }
        }
        else if (script.length === 1) {
          scope.acre.write("\n/** " + script[0] + " **/\n");
          if (script[0] in app_mf.javascript) {
            // you can chain mf.javascript declarations
            // WARNING! DOES NOT CHECK FOR CIRCULAR DEPENDENCIES!!!
            app_mf.js(script[0], scope);
          }
          else {
            try {
              scope.acre.write(app_mf.require(script[0]).body);
            }
            catch (ex) {
              scope.acre.write("\n/** " + ex.toString() + " **/\n");
            }
          }
        }
      }

    //   mf.javascript[key].forEach(function(script) {
    //     if (!(script instanceof Array)) {
    //       script = [script];
    //     }
    //     if (script.length === 2) {
    //       scope.acre.write(mf.require(script[0], script[1]).body);
    //     }
    //     else if (script.length === 3 && script[1] === "MANIFEST") {
    //       var ext_mf = mf.require(script[0], "MANIFEST").mf;
    //       var f = script[2].split("/", 2).pop();
    //       ext_mf.js(f, scope);
    //     }
    //     else {
    //       try {
    //         scope.acre.write(mf.require.apply(null, script).body);
    //       }
    //       catch (ex) {
    //         scope.acre.write("\n/** " + ex.toString() + " **/\n");
    //         return;
    //       }
    //     }
    //   });
    },

    require: function(app, file) {
      var args = app_mf.require_args(app, file);

      if (args.local) {
        return scope.acre.require(args.file);
      }
      if (!app_mf.apps[args.app]) {
        throw("An app label for \"" + args.app + "\" must be declared in the MANIFEST.");
      }
      var path = [app_mf.apps[args.app], args.file].join("/");
      return scope.acre.require(path);
    },

    get_metadata: function(app) {
      if (!app) {
        return scope.acre.get_metadata();
      }
      if (!app_mf.apps[app]) {
        throw("An app label for \"" + app + "\" must be declared in the MANIFEST.");
      }
      return scope.acre.get_metadata(app_mf.apps[app]);
    },

    not_found: function(id) {
      core_mf.require("routing", "routes").not_found(id);
    },

    /**
     * Main block. DO NOT MODIFY!
     *
     * Responsible for routing request to "/MANIFEST/..." or serve mf (json/p).
     *
     * usage:
     *   var mf = {...};
     *   acre.require("/freebase/site/core/MANIFEST").extend_manifest(mf, this);
     *   if (acre.current_script == acre.request.script) {
     *     mf.main();
     *   };
     */
    main: function() {
      var path_info = scope.acre.request.path_info;
      if (path_info && path_info.length) {
        var path = path_info.substring(1);
        if (/\.js$/.exec(path)) {
          return app_mf.js(path, scope);
        }
        else if (/\.css$/.exec(path)) {
          var use_acre_url = scope.acre.request.params.use_acre_url;
          return app_mf.css(path, scope, false, use_acre_url);
        }
        else if (path_info !== "/") {
          return app_mf.not_found(scope.acre.current_script.app.id + path_info);
        }
      }
      core_mf.require("service", "lib").GetService(function() {
        return app_mf;
      }, scope);
    }
  };

  base.app_base_url = base.get_app_base_url();
  base.image_base_url = base.app_base_url;
  base.static_base_url = base.app_base_url + "/MANIFEST";

  return base;
};

this.init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/core/d41d8cd98f00b204e9800998ecf8427e", "static_base_url": "http://freebaselibs.com/static/freebase_site/core/d41d8cd98f00b204e9800998ecf8427e"});
