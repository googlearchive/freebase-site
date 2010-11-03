/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
    var apps = extend({}, core_config.apps);
    if (config) {
      extend(apps, config.apps);
    }
    extend(config.apps, apps); // update config.apps with core_config.apps
    Manifest.prototype.init.apply(this, [scope, config]);
    this.libs = this.config.libs || {};
  },

  get_app_base_url: function() {
    if (/\.(freebase|sandbox\-freebase)\.com$/.test(this.scope.acre.request.server_name)) {
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
      return self.quoted_css_url(this.freebase_resource_url(url.substring(9)));
    }
    return Manifest.prototype.css_resource_url.apply(this, [url, use_acre_url]);
  },

  not_found: function(id) {
    this.require("routing", "routes").not_found(id);
  }
});

// core MANIFEST.mf
var mf = init(this);

