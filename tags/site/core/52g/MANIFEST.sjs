var core_config = JSON.parse(acre.get_source("CONFIG.json"));
var base_manifest = acre.require(core_config.apps.manifest + "/MANIFEST");
var Manifest = base_manifest.Manifest;
var extend = base_manifest.extend;

function init(scope, config, options) {
  var app_mf = new CoreManifest(scope, extend({}, config, options));
  if (scope.acre.current_script === scope.acre.request.script) {
    app_mf.main();
  }
  return app_mf;
};

function CoreManifest(scope, config) {
  this.init.apply(this, arguments);
};
CoreManifest.prototype = extend({}, Manifest.prototype, {
  init: function(scope, config) {
    config = extend({}, core_config, config);  // extend with core_config
    
    extend(config.apps, extend({}, core_config.apps, config.apps)); // update config.apps with core_config.apps
    Manifest.prototype.init.apply(this, [scope, config]);
    this.libs = this.config.libs || {};
  },

  get_app_base_url: function() {
    if (/^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(this.scope.acre.request.app_url)) {
      var app_routes = acre.require(this.apps.routing + "/app_routes");
      var app_path = this.scope.acre.current_script.app.path;
      var app_version = this.scope.acre.current_script.app.version;
      if (app_version) {
        var replace_version = new RegExp("^\/\/" + app_version + "\.");
        app_path = app_path.replace(replace_version, "//");
      }
      var app = app_routes.get_app(app_path);
      if (app) {
          var route = app_routes.rules.route_for_app(app);
          if (route) {
            if (!route.script) {
              return this.scope.acre.request.app_url + route.prefix;
            }
          }
      }
    }
    return Manifest.prototype.get_app_base_url.apply(this);
  },

  lib_base_url: function(key) {
    var lib = this.config.libs[key];
    return lib.base_url + lib.version;
  },

  freebase_resource_url: function(path) {
    var r = this.config.freebase.resource;
    return r.base_url + r.hash + path;
  },

  css_resource_url: function(url, use_acre_url) {
    if (url.indexOf("static://") === 0) {
      return "url(" + this.freebase_resource_url(url.substring(9)) + ")";
    }
    return Manifest.prototype.css_resource_url.apply(this, [url, use_acre_url]);
  },

  not_found: function(id) {
    this.require("routing", "routes").not_found(id);
  }
});

// core MANIFEST.mf
var mf = init(this);

