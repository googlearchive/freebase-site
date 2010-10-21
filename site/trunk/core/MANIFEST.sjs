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
    extend(config.apps, core_config.apps, config.apps); // update config.apps with core_config.apps
    Manifest.prototype.init.apply(this, [scope, config]);
    this.libs = this.config.libs || {};
  },

  get_app_base_url: function() {
    if (/^https?:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(this.scope.acre.request.app_url)) {
      var routes_mf = acre.require(this.apps.routing + "/MANIFEST");
      var app = routes_mf.get_app(this.scope.acre.current_script.app.path);
      if (app) {
          var rules = acre.require(this.apps.routing + "/app_routes").rules;
          var route = rules.route_for_app(app);
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

