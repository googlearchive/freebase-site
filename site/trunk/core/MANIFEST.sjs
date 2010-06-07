
var MF = {
  "version": {
    "/freebase/site/routing": null,
    "/freebase/libs/jquery": "release",
    "/freebase/apps/libraries": "release"
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
        "hash" : "dd20b6623a39c3624ab666c6f4e69f80423c7186ab9f8add7c53dd927ad389fa",
        "base_url": "http://res.freebase.com/s/"
      }
  }
};
MF.suggest.base_url += MF.suggest.version;
MF.freebase.resource.base_url += MF.freebase.resource.hash;

acre.require("/freebase/apps/libraries/api_enhancer", MF.version["/freebase/apps/libraries"]);
var h_util = acre.require("helpers_util");
var h_url = acre.require("helpers_url");

/**
 * usage:
 *   var MF = {...};
 *   acre.require("/freebase/site/core/MANIFEST").init(MF, this);
 */
function init(MF, scope, options) {
  extend_manifest(MF, scope, options);
  if (scope.acre.current_script === scope.acre.request.script) {
    MF.main();
  }
  // routes hack to call sjs main()
  scope.main = MF.main;
};

/**
 * All apps' MANIFEST.MF must extend the base_manifest to be able to:
 * - serve (less)css/js as defined in the MANIFEST
 * - serve MANIFEST.MF as json/p
 */
function extend_manifest(MF, scope, options) {
  var orig = h_util.extend({}, MF, options);
  return h_util.extend(MF, base_manifest(MF, scope), orig);
};

/**
 * The base MANIFEST core library.
 */
function base_manifest(MF, scope, undefined) {
  var base = {
    /**
     * MF.version, MF.stylesheet, MF.javascript default to empty dictionary
     */
    version: {},
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
     * The css resource(s) in MF.stylesheet[key] can be a relative css (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <link rel="stylesheet" type="text/css" href="${MF.css_src("foo.css")}"/>
     */
    css_src: function(key) {
      return MF.static_base_url + "/" + key;
    },
    /** DEPRECATED: use css_src **/
    link_href: function(key) {
      return MF.css_src(key);
    },

    /**
     * Generate the proper url to serve the js resource(s) specified by MF.javascript[key].
     * The js resource(s) in MF.javascript[key] can be a relative js (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <script type="text/javascript" src="${MF.script_src("foo.js")}"></script>
     */
    js_src: function(key) {
      return MF.static_base_url + "/" + key;
    },
    /** DEPRECATED: use js_src **/
    script_src: function(key) {
      return MF.js_src(key);
    },


    /**
     * Generate the proper url to serve an image resource specified by the resource_path.
     * The resource_path can be a relative resource (local app file)
     * or absolute (external app file). For an external resource,
     * you MUST specify the app id containing the external resource in MF.version.
     *
     * usage:
     *   <img src="${MF.img_src('local.png')}" /><!-- local image -->
     *   <img src="${MF.img_src('/freebase/site/app/external.png')}" /><!-- external image -->
     */
    img_src: function(resource_path) {
      var resource = MF._resource_info(resource_path);
      if (resource.local) {
        // local image files relative to the current app
        return MF.image_base_url + "/" + resource.name;
      }
      else {
        // get the url through the external app MANIFEST.MF.img_src(resource.name)
        var ext_resource = h_util.extend({}, resource, {id:resource.appid+"/MANIFEST", name:"MANIFEST"});
        try {
          var ext_mf = MF.require(ext_resource).MF;
          return ext_mf.img_src(resource.name);
        }
        catch (ex) {
          console.log("MF.img_src: no MANIFEST in external app", resource.appid, ex);
          return MF.resource_url(resource);
        }
      }
    },

    /**
     * less (css) parser.
     */
    less: function(data /*required*/, callback /*required*/, errback /*optional*/) {
      if (!MF.less.parser) {
        MF.less.parser = new(MF.require("/freebase/site/core/less").less.Parser)({optimization:3});
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
    css: function(key) {
      if (!MF.stylesheet[key]) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/css");

      var buf = [];
      MF.stylesheet[key].forEach(function(id) {
        var source;
        try {
          // css preprocessor to replace url(resource_path) declarations
          buf.push(MF.css_preprocessor(MF.require(id).body));
        }
        catch (ex) {
          scope.acre.write("\n/** " + ex.toString() + " **/\n");
          return;
        }
      });

      // run less on concatenated css/less
      MF.less(buf.join(""),
              scope.acre.write,
              function(e) {
                scope.acre.write(scope.JSON.stringify(e, null, 2));
              });
    },

    css_preprocessor: function(str) {
      var buf = [];
      var m, regex = /url\s*\(\s*([^\)]+)\s*\)/gi;
      str.split(/[\n\r\f]/).forEach(function(l) {
        buf.push(l.replace(regex, function(m, group) {
          var url = group.trim();
          if (url.startsWith("http://") || url.startsWith("https://")) {
            return m;
          }
          return "url(" + MF.resource_url(url) + ")";
        }));
      });
      return buf.join("\n");
    },

    /**
     * Serve (acre.write) all js declared in MF.javascript[key].
     */
    js: function(key) {
      if (!MF.javascript[key]) {
        return MF.not_found();
      }
      scope.acre.response.set_header("content-type", "text/javascript");
      MF.javascript[key].forEach(function(id) {
        var source;
        try {
          scope.acre.write(MF.require(id).body);
        }
        catch (ex) {
          scope.acre.write("\n/** " + ex.toString() + " **/\n");
          return;
        }

      });
    },

    /**
     * Match resource_path to an app version declared in MF.version
     * If resource_path is unrecognized (i.e., app_id not declared in MF.version),
     * throws error.
     */
    _resource_info: function(resource_path) {
      if (resource_path[0] !== "/") {
        return {
          id: scope.acre.current_script.app.id + "/" + resource_path,
          version: null,
          appid: scope.acre.current_script.app.id,
          name: resource_path,
          local: true
        };
      }
      var appid = resource_path.split("/");
      var name = appid.pop();
      appid = appid.join("/");
      if (appid in MF.version) {
        return {
          id: resource_path,
          version: MF.version[appid],
          appid: appid,
          name: name,
          local: false
        };
      }
      throw "A version for " + appid + " must be declared in the MANIFEST.";
    },

    /**
     * resource can be a string (resource_path) or
     * an object (returned by MF._resource_info)
     *
     * You can pass an object returned by MF._resource_info
     * to avoid another MF._resource_info lookup.
     * @see MF.img_src
     */
    require: function(resource /** string or object **/) {
      if (typeof resource === "string") {
        resource = MF._resource_info(resource);
      }
      return scope.acre.require(resource.id, resource.version);
    },

    resource_url: function(resource /** string or object **/) {
      if (typeof resource === "string") {
        resource = MF._resource_info(resource);
      }
      return h_url.resource_url(resource.id, resource.version);
    },

    not_found: function() {
      scope.acre.response.status = 404;
      scope.acre.exit();
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
      console.log("MANIFEST.main");
      if (scope.acre.request.path_info && scope.acre.request.path_info.length) {
        var path = scope.acre.request.path_info.substring(1);
        if (/\.js$/.exec(path)) {
          return MF.js(path);
        }
        else if (/\.css$/.exec(path)) {
          return MF.css(path);
        }
        else if (scope.acre.request.path_info !== "/") {
          return MF.not_found();
        }
      }
      var service = scope.acre.require("/freebase/libs/service/lib", "release");
      return service.GetService(function() {
        return MF;
      }, scope);
    }
  };

  return base;
};

this.init(MF, this);
