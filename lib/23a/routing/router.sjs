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
var object_query = acre.require("queries/object.sjs");
var freebase_object = acre.require("template/freebase_object.sjs");

var self = this;
/**
 * Extend the default rules for this site with the environment specific rules.
 */
function extend_default_rules(rules, environment_rules) { 

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
        rules["prefix"].forEach(
            function(route) { 
                if (!route["prefix"]) { 
                    throw("You can not define a prefix routing rule without a prefix.");
                    exit(-1);
                }
                prefix_index[route.prefix] = i;
                i++;
            });
        
        environment_rules["prefix"].forEach(
            function(route) { 
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

    // TODO: object and host overrides (not necessary now).

    return rules;
}


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
 * Deal with the special case of routing 
 *
 *   Note: to debug the homepage, use the \/homepage prefix rule 
 *         (e.g., /homepage?acre.console=1)
 *
 */

function HomeRouter(app_labels) {
  
    var route = this.route = function(req) {
    
    // This only applies to "/"
    if (req.path_info !== "/") {
      return false;
    }
    
    // let object router handle ?inspect
    if ("inspect" in req.params) {
      return false;
    }

    // otherwise run the logged-out homepage, which will redirect to user page if logged-in
    acre.route(acre.form.build_url(app_labels["homepage"] + "/index.controller", req.params));
    acre.exit();
    
  };
  
};

function ObjectRouter(app_labels) {
  var route_list = [];
  var types = {};

  function set_app(item) {
    if (item.app) {
      var app = app_labels[item.app];
      if (!app) {
        throw 'An app label must exist for: ' + item.app;
      }
      item.app = app;
    }
    return item;
  };

  this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      [route.tabs, route.navs, route.promises].forEach(function(list) {
        list && list.forEach(function(item) {
          set_app(item);
          item.promises && item.promises.forEach(function(p) {
            set_app(p);
          });
        });
      });
      types[route.type] = route;
      h.splice_with_key(route_list, "type", route);
    });
  };

  this.route = function(req) {

    var path_info = req.path_info;

    var req_id = validators.MqlId(path_info, {if_invalid:null});

    if (req_id) {

      var o;
      var d = object_query.object(req_id)
        .then(function(obj) {
          o = obj;
        });

      acre.async.wait_on_results();

      d.cleanup();

      if (o) {

        if (o.replaced_by) {
          return h.redirect(self, o.replaced_by.mid);
        }
        else if (!(req_id === o.mid || req_id === o.id)) {
          // request id is NOT a mid and NOT a mql "approved" id
          return h.redirect(self, o.mid);
        }
        else {
          if (h.startsWith(req_id, "/en/")) {
            // request id is /en/*, redirect to mid
            return h.redirect(self, o.mid);
          }
          else if (req_id === o.mid && !(o.id === o.mid || h.startsWith(o.id, "/en"))) {
            // request id is mid, but object id is NOT /en/*
            return h.redirect(self, o.id);
          }
          else {
            // we should now have the canonical id
            o.id = o["q:id"];

            // Build type map for object
            var obj_types = h.map_array(o.type, "id");
            obj_types["/type/object"] = true; // all valid IDs are /type/object

            var rule, i, l;
            // Find correct rule for this object
            for (i=0,l=route_list.length; i<l; i++) {
              var route = route_list[i];
              var type = route.type;
              if (obj_types[type]) {
                // clone tabs spec so we don't overwrite it
                rule = h.extend(true, {}, route);
                break;
              }
            }

            // Turn tab config arrays into something more useful
            if (!rule) {
              throw "Missing rule configuration for this object";
            }

            acre.write(freebase_object.main(rule, o));
            acre.exit();
          }
        }

      }
    }
  };

  var dump = this.dump = function() {
    return route_list.slice();
  };

};

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


var routers = [["host", HostRouter], ["home", HomeRouter], ["prefix", PrefixRouter], ["object", ObjectRouter]];

function route(default_rules, environment_rules, scope) {

  var rules = extend_default_rules(default_rules, environment_rules);
  var dump = acre.request.base_path === "/_fs_routing";

  var rules_dump = {};

  for (var i=0,l=routers.length; i<l; i++) {
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
      router.route(scope.acre.request);
    }
  }

  if (dump) {
    rules_dump['apps'] = rules["labels"];
    scope.acre.write(JSON.stringify(rules_dump, null, 2));
    scope.acre.exit();
  }
  else {
    // TODO: not found
    acre.route("error/error.mjt");
  }
};
