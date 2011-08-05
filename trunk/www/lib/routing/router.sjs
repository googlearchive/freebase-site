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

var h = acre.require("helper/helpers.sjs");
var validators = acre.require("validator/validators.sjs");

var routers_map = {
  "host" : HostRouter, 
  "prefix" : PrefixRouter, 
  "static" : StaticRouter,
  "ajax" : AjaxRouter
};

var default_routers = ["host", "static", "ajax", "prefix"];


/**
 * host->url redirector
 */
function HostRouter() {
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
      route_map[route.host] = route.url;
      h.splice_with_key(route_list, "host", route);
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
      return true;
    }
    return false;
  };

  var dump = this.dump = function() {
    return route_list.slice();
  };

};

function is_proxyable(app_path, scope) {
  var site_md = acre.get_metadata(scope.acre.current_script.app.path);
  
  // is it in the same project?
  if ((app_path == "//" + site_md.project) || 
      h.endsWith(app_path, "." + site_md.project)) {
    return true;
  }
  
  // is it one of our mounted apps?
  for (var mount in site_md.mounts) {
    var path = site_md.mounts[mount];
    if (path === app_path) {
      return true;
    }
  }

  // no? then bail
  return false;
}


function StaticRouter() {
  var add = this.add = function(routes) {};

  var route = this.route = function(req, scope) {
    var qs = req.query_string;
    var segs = req.path_info.split("/");
    segs.shift();
    
    // only handle /static URLs
    if (segs.shift() !== "static") {
      return false;
    }
    
    // only proxy if it's in a mounted app
    if (!is_proxyable("//" + segs[0], scope)) {
      return false;
    }

    var path = "//" + segs.join("/") + (qs ? "?" + qs : "");
    // console.log("StaticRouter path", path);
    var content = acre.include(path);
    var headers = content.headers;
    //console.log("static headers", headers);
    if (headers) {
      for (var k in headers) {
        acre.response.set_header(k, headers[k]);
      }
    }
    acre.write(content);
    acre.exit();
  };
};


function AjaxRouter() {
  var add = this.add = function(routes){};

  var route = this.route = function(req, scope) {
    var qs = req.query_string;
    var segs = req.path_info.split("/");
    segs.shift()

    // only handle /ajax URLs
    if (segs.shift() !== "ajax") {
      return false;
    }
    
    // only proxy if it's in a mounted app
    if (!is_proxyable("//" + segs[0], scope)) {
      return false;
    }

    var path = "//" + segs.join("/") + (qs ? "?" + qs : "");
    // console.log("AjaxRouter path", path);
    acre.route(path);
  };
};


/**
   ----Prefix routing logic for Acre---
   1. Add routes with router.add({prefix:, app:, script:?, redirect:?, url:?})
      there can only be one route per exact prefix
      there can only be one route per app, script combo
   2. Find the route for request path with router.route_for_path(path)
 */
function PrefixRouter(app_labels) {
  var route_list = [];
  var routing_tree = {};

  var key_for_app = function(app, script) {
    var key = app;
    if (script) {
      key += '/'+script;
    }
    return key;
  };
  
  var split_path = function(prefix) {
    var parts = prefix.split('/');
    if (parts[parts.length-1] === "") {
      parts[parts.length-1] = "/";
    }
    return parts;
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
      if (route.app) {
        var app = app_labels[route.app];
        if (false && !app) {
          throw 'An app label must exist for: ' + route.app;
        }
        // replace route.app with actual app path
        route.app = app;
      }


      // Find the leaf node for this prefix and place the routing rule there
      var subtree = traverse_key_tree(routing_tree, split_path(route.prefix), true);
      subtree.route = route;
      h.splice_with_key(route_list, "prefix", route);
    });
  };

  var route_for_path = this.route_for_path = function(path) {
    var subtree = traverse_key_tree(routing_tree, split_path(path));
    return subtree.route;
  };

  var dump = this.dump = function() {
    return route_list.slice();
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
    if (rule) {
      if (rule.redirect && "url" in rule) {
        // Handle both absolute and relative redirects
        acre.response.status = rule.redirect;
        var redirect_url;
        if (/^https?:\/\//.test(rule.url)) {
          redirect_url = rule.url;
        } else {
          redirect_url = acre.form.build_url(req.app_url + req_path.replace(rule.prefix, rule.url), rule.params);
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
            rule.app,
            "/",
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
* Extend the default rules for this site with the environment specific rules.
*/
function extend_rules(rules, environment_rules) { 

  // Here we handle configuration overrides from specific environments. 

  // Labels environment override.

  if (environment_rules["labels"]) { 
    h.extend(rules["labels"], environment_rules["labels"])
    for (var app_label in environment_rules["labels"]) { 
      rules["labels"][app_label] = environment_rules["labels"][app_label]
    }
  }

  // Prefix environment override.

  if (environment_rules["prefix"]) { 

    // Holds prefix -> index in prefix routing array. 
    var prefix_index = {}
    var i = 0;
    rules["prefix"].forEach(function(route) { 
      if (!route["prefix"]) { 
        throw("You can not define a prefix routing rule without a prefix.");
        exit(-1);
      }
      prefix_index[route.prefix] = i;
      i++;
    });

    environment_rules["prefix"].forEach(function(route) { 
      if (!route["prefix"]) { 
        throw("You can not define a prefix routing rule without a prefix.");
        exit(-1);
      }
      // Overwrite the rule if it exists in the base rules.
      if (prefix_index[route.prefix] != undefined) { 
        rules["prefix"][prefix_index[route.prefix]] = route;
      } else {
        rules["prefix"].push(route);
      }
    });
  }

  // Routers

  // default order if not specified
  if (!rules["routers"]) { 
    rules["routers"] = default_routers;
  }

  // override with the environment rules if specified.
  if (environment_rules["routers"]) { 
    rules["routers"] = environment_rules["routers"];
  }

  var tmp_routers = [];
  for (var i in rules["routers"]) { 
    var router = rules["routers"][i];

    if (h.isArray(router)) {
      tmp_routers.push(router);
    } else if ((typeof router === 'string') && routers_map[router]) { 
      tmp_routers.push([router, routers_map[router]]);
    } else {
      throw "There is no router named " + router + " available.";
    }
  }

  rules["routers"] = tmp_routers;

  // TODO: object and host overrides (not necessary now).
  return rules;
}


function route(rules, scope) {

  var dump = acre.request.base_path === "/_fs_routing";

  var rules_dump = {};

  if (rules["routers"]) { 
    routers = rules["routers"];
  }

  for (var i=0,l=routers.length; i<l; i++) {
    syslog.info({}, "trying router " + routers[i][0]);
    var name = routers[i][0];
    var router_class = routers[i][1];
    var router = new router_class(rules["labels"]);
    var rule = rules[name];
    if (rule) {
      // to over-ride or add to existing rules defined in the specific router
      router.add(rule);
    }

    if (dump && "dump" in router) {
      rules_dump[name] = router.dump();
    }
    else {
      router.route(scope.acre.request, scope);
    }
  }

  if (dump) {
    rules_dump['apps'] = rules["labels"];
    scope.acre.write(JSON.stringify(rules_dump, null, 2));
    scope.acre.exit();
  }
  else {
    // TODO: not found
    acre.route("error/not_found.mjt");
  }
};
