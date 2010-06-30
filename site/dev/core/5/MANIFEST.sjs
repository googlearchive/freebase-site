var MF = {
  "apps" : {
    "routing" : "//6.routing.site.freebase.dev",
    "promise" : "//3.promise.site.freebase.dev",
    "service" : "//4.service.libs.freebase.dev",
    "libraries" : "//2.libraries.apps.freebase.dev"
  },
  "freebase": {
    "resource": {
      "hash" : "dd20b6623a39c3624ab666c6f4e69f80423c7186ab9f8add7c53dd927ad389fa",
      "base_url": "http://res.freebase.com/s/"
    }
  }
};
MF.freebase.resource.base_url += MF.freebase.resource.hash;
var CORE_MF = MF;

var extend = acre.require("helpers_util").extend;
var freebase_static_resource_url;


/**
 * usage:
 *   var MF = {
 *     apps: {
 *       core: "//core.site.freebase.dev",
 *       ...
 *     }
 *     ...
 *   };
 *   acre.require(MF.apps.core).init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/core/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/core/$Rev$"});
 */
function init(MF, scope, options) {
  extend_manifest(MF, scope, options);
  if (scope.acre.current_script === scope.acre.request.script) {
    MF.main();
  }
};

/**
 * All apps' MANIFEST.MF must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.MF as json/p
 */
function extend_manifest(MF, scope, options) {
  var orig = extend({}, MF, options);
  return extend(MF, base_manifest(MF, scope), orig);
};

/**
 * The base MANIFEST core library.
 */
function base_manifest(MF, scope, undefined) {
  var base = {
    /**
     * MF.apps, MF.stylesheet, MF.javascript default to empty dictionary
     */
    apps: {},
    stylesheet: {},
    javascript: {},

    /**
     * The base url prefix for retrieving css and js. All apps who extend the base_manifest
     * will have a "/MANIFEST/..." entry-point to serve css and js as specified in their MF.stylesheet
     * and MF.javascript.
     *
     * The idea is that once an app is branched/deployed, this static_base_url will be changed
     * to a permanent static server (i.e., http://freebaselibs.com/statc/freebase_site/foo/[version]/...).
     * But when developing, we want the resources to be served dynamically through "/MANIFEST/...".
     *
     */
    static_base_url: scope.acre.current_script.app.base_url +  "/MANIFEST",

    /**
     * This is like static_base_url but for images (*.png, *.gif, etc.).
     *
     */
    image_base_url: scope.acre.current_script.app.base_url,

    /**
     * Generate the proper url to serve the css resource(s) specified by MF.stylesheet[key].
     * MF.stylesheet[key] value must be an array of strings (local file) and/or tuples defining
     * the app label, file and any additional parameters.
     *
     * var MF = {
     *   ...
     *   stylesheet: {
     *     "my.mf.css": [
     *       "local.css",    // local css
     *       ["external_app_label", "external.less"],  // external css
     *       ["external_app_label", "MANIFEST", "/external.mf.css"]  // external manifest css
     *     ],
     *   ...
     *   }
     * }
     * For the tuple declarations, you MUST specify the app label in MF.apps.
     *
     * usage:
     *   <link rel="stylesheet" type="text/css" href="${MF.css_src("my.mf.css")}"/>
     */
    css_src: function(key) {
      return MF.static_base_url + "/" + key;
    },


    /**
     * Generate the proper url to serve the js resource(s) specified by MF.javascript[key].
     * MF.javascript[key] value must be an array of strings (local file) and/or tuples defining
     * the app label, file and any additional parameters.
     * var MF = {
     *   ...
     *   javascript: {
     *     "my.mf.js": [
     *       "local.js",    // local js
     *       ["external_app_label", "external.js"],  // external js
     *       ["external_app_label", "MANIFEST", "/external.mf.js"]  // external manifest js
     *     ],
     *   ...
     *   }
     * }
     * For the tuple declarations, you MUST specify the app label in MF.apps.
     *
     * usage:
     *   <script type="text/javascript" src="${MF.js_src("my.mf.js")}"></script>
     */
    js_src: function(key) {
      return MF.static_base_url + "/" + key;
    },

    /**
     * Helper method to parse app label, file arguments.
     * If one argument, first argument is the file name of the local resource.
     * If two arguments, first argument is the app label (defined in MF.apps) and second is the file name.
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
     *   <img src="${MF.img_src('local.png')}" /><!-- local image -->
     *   <img src="${MF.img_src('some_app_label', 'external.png')}" /><!-- external image -->
     */
    img_src: function(app, file) {
      var args = MF.require_args(app, file);
      if (args.local) {
        // local image files relative to the current app
        return MF.image_base_url + "/" + args.file;
      }
      else {
        // get the url through the external app MANIFEST.MF.img_src(resource.name)
        var ext_mf = MF.require(args.app, "MANIFEST").MF;
        return ext_mf.img_src(args.file);
      }
    },

    /**
     * less (css) parser.
     */
    less: function(data /*required*/, callback /*required*/, errback /*optional*/) {
      if (!MF.less.parser) {
          MF.less.parser = new(MF.require("core", "less").less.Parser)({optimization:3});
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
     * Run the less css parser on all of the css afterwards
     */
    css: function(key, scope, buffer) {
      if (!MF.stylesheet[key]) {
        return MF.not_found(scope.acre.current_script.app.id + "/MANIFEST/" + key);
      }
      scope.acre.response.set_header("content-type", "text/css");

      var buf = [];
      MF.stylesheet[key].forEach(function(ss) {
        if (!(ss instanceof Array)) {
          ss = [ss];
        }
        if (ss.length > 1) {
          var ext_mf = MF.require(ss[0], "MANIFEST").MF;
          if (ss.length === 2) {
            // run css_preprocessor within the context of ext_mf
            buf.push(ext_mf.css_preprocessor(ext_mf.require(ss[1]).body));
          }
          else if (ss.length === 3 && ss[1] === "MANIFEST") {
            // get external css manifest content within the context of ext_mf
            var f = ss[2].split("/", 2).pop();
            buf = buf.concat(ext_mf.css(f, scope, true));
          }
        }
        else {
          try {
            // css preprocessor to replace url(...) declarations
            buf.push(MF.css_preprocessor(MF.require.apply(null, ss).body));
          }
          catch (ex) {
            scope.acre.write("\n/** " + ex.toString() + " **/\n");
            acre.exit();
          }
        }
      });

      if (buffer) {
        return buf;
      }

      // run less on concatenated css/less
      MF.less(buf.join(""),
              scope.acre.write,
              function(e) {
                scope.acre.write(scope.JSON.stringify(e, null, 2));
              });
    },

    css_preprocessor: function(str) {
      if (!freebase_static_resource_url) {
        freebase_static_resource_url = MF.require("core", "helpers_url").freebase_static_resource_url;
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
            return "url(" + MF.img_src.apply(null, params).replace(/\s/g, '%20') + ")";
          }
        }));
      });
      return buf.join("\n");
    },

    /**
     * Serve (acre.write) all js declared in MF.javascript[key].
     */
    js: function(key, scope) {
      if (!MF.javascript[key]) {
        return MF.not_found(scope.acre.current_script.app.id + "/MANIFEST/" + key);
      }
      scope.acre.response.set_header("content-type", "text/javascript");
      MF.javascript[key].forEach(function(script) {
        if (!(script instanceof Array)) {
          script = [script];
        }
        if (script.length > 1) {
          var ext_mf = MF.require(script[0], "MANIFEST").MF;
          if (script.length === 2) {
            scope.acre.write(ext_mf.require(script[1]).body);
          }
          else if (script.length === 3 && script[1] === "MANIFEST") {
            var f = script[2].split("/", 2).pop();
            ext_mf.js(f, scope);
          }
        }
        else {
          try {
            scope.acre.write(MF.require.apply(null, script).body);
          }
          catch (ex) {
            scope.acre.write("\n/** " + ex.toString() + " **/\n");
            return;
          }
        }
      });
    },

    require: function(app, file) {
      var args = MF.require_args(app, file);
      if (args.local) {
        return scope.acre.require(args.file);
      }
      if (!MF.apps[args.app]) {
        throw("An app label for \"" + args.app + "\" must be declared in the MANIFEST.");
      }
      var path = [MF.apps[args.app], args.file].join("/");
      return scope.acre.require(path);
    },

    not_found: function(id) {
      CORE_MF.require("routing", "routes").not_found(id);
    },

    /**
     * Main block. DO NOT MODIFY!
     *
     * Responsible for routing request to "/MANIFEST/..." or serve MF (json/p).
     *
     * usage:
     *   var MF = {...};
     *   acre.require("/freebase/site/core/MANIFEST").extend_manifest(MF, this);
     *   if (acre.current_script == acre.request.script) {
     *     MF.main();
     *   };
     */
    main: function() {
      var path_info = scope.acre.request.path_info;
      if (path_info && path_info.length) {
        var path = path_info.substring(1);
        if (/\.js$/.exec(path)) {
          return MF.js(path, scope);
        }
        else if (/\.css$/.exec(path)) {
          return MF.css(path, scope);
        }
        else if (path_info !== "/") {
          return MF.not_found(scope.acre.current_script.app.id + path_info);
        }
      }
      CORE_MF.require("service", "lib").GetService(function() {
        return MF;
      }, scope);
    }
  };

  return base;
};

this.init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/core/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/core/$Rev$"});
