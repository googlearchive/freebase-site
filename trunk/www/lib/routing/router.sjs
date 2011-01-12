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
var h = acre.require("routing/helpers");

/**
   ----Prefix routing logic for Acre---
   1. Add routes with router.add({prefix:, app:, script:?, redirect:?, url:?})
      there can only be one route per exact prefix
      there can only be one route per app, script combo
   2. Find the route for app, script combo with router.route_for_app(app, script?)
   3. Find the route for request path with router.route_for_path(path)
 */
var PrefixRouter = function() {
  var route_list = [];
  var routing_tree = {};
  var canonical_routes = {};

  var key_for_app = function(app, script) {
    var key = app;
    if (script) {
      key += '/'+script;
    }
    return key;
  };

  var traverse_key_tree = function(tree, keys, expand_leaves) {
    // Find the subtree at the end of the list of keys
    var current_tree = tree;

    for (var i in keys) {
      var key = 'key-' + keys[i];
      if (!current_tree[key]) {
        if (expand_leaves) {
          current_tree[key] = {};
        } else {
          break;
        }
      }
      current_tree = current_tree[key];
    };

    return current_tree;
  };

  // Routes must contain "prefix" and:
  //  1. app - routes to the default routing for this app
  //  2. app, script - routes to this script from this app
  //  3. redirect, url - redirect to url with redirect code
  var add = this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }

    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      if (typeof route.prefix !== 'string' || route.prefix.indexOf('/') !== 0) {
        throw 'A routing rule must contain a valid prefix: '+JSON.stringify(route);
      }
      if (route.redirect && (
          typeof route.redirect !== 'number' ||
          route.redirect < 300 || route.redirect > 399)) {
        throw 'A redirect must be a valid numeric code: '+ route.redirect;
      }

      // Find the leaf node for this prefix and place the routing rule there
      var subtree = traverse_key_tree(routing_tree, route.prefix.split('/'), true);

      if (subtree.route) {
        throw 'Prefix already exists: cannot override old route('+JSON.stringify(subtree.route)+') with a new route ('+JSON.stringify(route)+')';
      }
      subtree.route = route;

      // If this is a canonical route for an app then store it
      // There can only be one route per app,script combo
      if (route.app && !route.redirect) {
        var key = key_for_app(route.app, route.script);
        if(canonical_routes[key]) {
          throw 'Canonical route already exists: cannot override old route('+JSON.stringify(canonical_routes[key])+') with a new route ('+JSON.stringify(route)+')';
        }
        canonical_routes[key] = route;
      }

      route_list.push(route);
    });
  };

  var route_for_app = this.route_for_app = function(app, script) {
    // First try to see if there is a specific route for this script
    var route = canonical_routes[key_for_app(app, script)];
    // Then check if there is just routing for this app
    if (!route) {
      route = canonical_routes[key_for_app(app)];
    }
    return route;
  };

  var route_for_path = this.route_for_path = function(path) {
    var subtree = traverse_key_tree(routing_tree, path.split('/'));
    return subtree.route;
  };

  var all_routes = this.all_routes = function() {
    return route_list.slice(0);
  };

  var route = this.route = function(req) {
    var req_path = req.url.replace(req.app_url, "");
    // filter out query string
    var path = req_path;
    var query_string;
    if (req_path.indexOf("?") !== -1) {
      var path_segs = req_path.split("?", 2);
      path = path_segs[0];
      query_string = path_segs[1];
    }

    var rule = route_for_path(path);
    console.log(path);
    if (rule) {
      if (rule.redirect && rule.url) {
        // Handle both absolute and relative redirects
        acre.response.status = rule.redirect;
        var redirect_url;
        if (/^https?:\/\//.test(rule.url)) {
          redirect_url = rule.url;
        } else {
          redirect_url = req.app_url + req_path.replace(rule.prefix, rule.url);
        }
        acre.response.set_header("location", redirect_url);
        acre.exit();
      }
      else if (rule.app) {
        var script = rule.script;
        var path_info = path.replace(rule.prefix, '');

        if (!script) {
          var [script, path_info, qs] = h.split_path(path_info);
        }
        // acre.route and exit
        acre.route([
            (rule.app ? rule.app + "/" : ""),
            script,
            path_info,
            (query_string ? "?" + query_string : "")
        ].join(""));
        acre.exit();
      }
    }
    return false;
  };
};


/**
 * host->url redirector
 */
var HostRouter = function() {
  var route_list = [];
  var route_map = {};

  var add = this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || !route.host || !route.url) {
        throw 'A routing rule must be a dict with valid host and url: ' + JSON.stringify(route);
      }
      route_list.push(route);
      route_map[route.host] = route.url;
    });
  };

  var route = this.route = function(req) {
    var url = route_map[req.server_name];
    if (url) {
      var req_path = req.url.replace(req.app_url, "");
      acre.response.status = 301;
      acre.response.set_header("location", url + req_path);
      acre.response.set_header("cache-control", "public, max-age: 3600");
      acre.exit();
    }
    return false;
  };
};


/**
 * /static/path -> //path router
 */
var GlobalRouter = function() {
  var add = this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    // no op for now
  };

  var route = this.route = function(req) {
    var req_path = req.url.replace(req.app_url, "");
    //all requests that start with /fss/ are for static files
    if (req_path.indexOf("/global/") != 0) {
      return false;
    }
    var file_path = req_path.replace("/global/", "//");
    acre.route(file_path);
    acre.exit();
  };
};
