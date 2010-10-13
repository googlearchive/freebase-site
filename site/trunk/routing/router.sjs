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
};