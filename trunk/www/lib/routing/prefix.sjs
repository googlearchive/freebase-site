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
var exports = {
  router: PrefixRouter
};

var h = acre.require("helper/helpers_util.sjs");
var rh = acre.require("routing/helpers");



var rules = [
  // Urls for user-facing apps
  {prefix:"/favicon.ico",        app:"lib", script: "template/favicon.ico"},
  {prefix:"/",                   app:"homepage", script: "index"},
  {prefix:"/index",              url:"/", redirect: 301},
  {prefix:"/home",               app:"homepage", script: "home"},
  {prefix:"/homepage",           app:"homepage"},
  {prefix:"/schema",             app:"schema"},
  {prefix:"/apps",               app:"apps"},
  {prefix:"/appeditor",          app:"appeditor"},
  {prefix:"/docs",               app:"docs"},
  {prefix:"/policies",           app:"policies"},
  {prefix:"/queryeditor",        app:"query"},
  {prefix:"/labs/cubed",         app:"cubed"},
  {prefix:"/labs/parallax",      app:"parallax"},
  {prefix:"/labs",               app:"labs"},
  {prefix:"/account",            app:"account"},

  // Urls for exposed ajax libraries and static resources
  // TODO: remove this and use ajax router
  {prefix:"/static",             app:"lib", script:"routing/static.sjs"},
  {prefix:"/ajax",               app:"lib", script:"routing/ajax.sjs"},

  // Urls for administrative tools
  {prefix:"/admin",              app:"admin"},
  {prefix:"/app/tmt",            app:"tmt"},

  //
  // Redirect away from client urls
  //
  {prefix:"/edit/topic",              url:"/topic", redirect:301},
  {prefix:"/site/feedback",           url:"http://bugs.freebase.com", redirect:301},
  {prefix:"/user/settings",           url:"/", redirect:301},
  {prefix:"/signin/recoverpassword",  url:"/", redirect:301},
  {prefix:"/signin/changepassword",   url:"/", redirect:301},
  {prefix:"/signin/activate",         url:"/", redirect:301},
  {prefix:"/signin/authorize_token",  url:"/", redirect:301},
  {prefix:"/discuss/threads",         url:"/inspect", redirect:301},
  {prefix:"/user/replies",            url:"/inspect", redirect:301},
  {prefix:"/history/view",            url:"/inspect", redirect:301},
  {prefix:"/tools/flags/review",      url:"/inspect", redirect:301},
  {prefix:"/importer/list",           url:"/inspect", redirect:301},
  {prefix:"/domain/users",            url:"/schema", redirect:301},
  {prefix:"/search",                  url:"/", redirect:301},

  //
  // Redirects for legacy urls
  //
  // Signin
  {prefix:"/signin/recoverPassword",  url:"/signin/recoverpassword", redirect:301},
  {prefix:"/signin/recoverPassword3", url:"/signin/changepassword", redirect:301},
  {prefix:"/private/account/activate", url:"/signin/activate", redirect:301},
  {prefix:"/signin/app",              url:"/signin/authorize_token", redirect:301},

  // Account settings
  {prefix:"/view/account",            url:"/user/settings/account", redirect:301},
  {prefix:"/user/account",            url:"/user/settings/account", redirect:301},

  // Wiki
  {prefix:"/help",                    url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/help/faq",                url:"http://wiki.freebase.com/wiki/FAQ", redirect:301},
  {prefix:"/developer",               url:"http://wiki.freebase.com/wiki/Developers", redirect:301},
  {prefix:"/view/developer",          url:"http://wiki.freebase.com/wiki/Developers", redirect:301},
  {prefix:"/view/faq",                url:"http://wiki.freebase.com/wiki/FAQ", redirect:301},
  {prefix:"/view/documentation",      url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/view/helpsearch",         url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/view/helpcenter",         url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/view/tutorial",           url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/view/discussionhub",      url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/discuss/hub",             url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/tools",                   url:"http://wiki.freebase.com", redirect:301},
  {prefix:"/build",                   url:"http://wiki.freebase.com", redirect:301},

  // Feedback
  {prefix:"/view/feedback",           url:"/site/feedback", redirect:301},
  {prefix:"/view/feedback_thanks",    url:"/site/feedback_thanks", redirect:301},

  // Discuss
  {prefix:"/view/discuss",            url:"/discuss/threads", redirect:301},
  {prefix:"/view/mydiscuss",          url:"/user/replies", redirect:301},
  {prefix:"/user/discuss",            url:"/user/replies", redirect:301},

  // Homepage
  {prefix:"/view/mydomains",          url:"/home", redirect:301},
  {prefix:"/user/domains",            url:"/home", redirect:301},
  {prefix:"/signin",                  url:"/", redirect:301},
  {prefix:"/signin/signin",           url:"/", redirect:301},
  {prefix:"/signin/signin.html",      url:"/", redirect:301},
  {prefix:"/site/data",               url:"/", redirect:301},
  {prefix:"/view/allDomains",         url:"/", redirect:301},
  {prefix:"/data",                    url:"/", redirect:301},
  {prefix:"/explore",                 url:"/", redirect:301},

  // User profile
  {prefix:"/view/user",               url:"/user/profile", redirect:301},

  // History
  {prefix:"/view/history",            url:"/history/view", redirect:301},
  {prefix:"/history/user",            url:"/history/view", redirect:301},
  {prefix:"/history/topic",           url:"/history/view", redirect:301},

  // Schema
  {prefix:"/view/schema",             url:"", params: {"schema":""}, redirect:301},
  {prefix:"/tools/schema",            url:"", params: {"schema":""}, redirect:301},
  {prefix:"/type/schema",             url:"", params: {"schema":""}, redirect: 301},

  // Queryeditor
  {prefix:"/app/queryeditor",         url:"/queryeditor", redirect:301},
  {prefix:"/tools/queryeditor",       url:"/queryeditor", redirect:301},
  {prefix:"/view/queryeditor",        url:"/queryeditor", redirect:301},

  // Inspect
  {prefix:"/tools/explore",           url:"/inspect", redirect:301},
  {prefix:"/tools/explore2",          url:"/inspect", redirect:301},

  // Appeditor
  {prefix:"/tools/appeditor",         url:"/appeditor", redirect:301},

  // Review queue
  {prefix:"/tools/pipeline/home",     url:"/tools/flags/review", redirect:301},
  {prefix:"/tools/pipeline/showtask", url:"/tools/flags/review", redirect:301},

  // List Importer
  {prefix:"/import/list",             url:"/importer/list", redirect:301},

  // Search
  {prefix:"/view/search",             url:"/search", redirect:301},

  // Policies
  {prefix:"/signin/tos",              url:"/policies/tos", redirect:301},
  {prefix:"/signin/cc",               url:"/policies/copyright", redirect:301},
  {prefix:"/signin/freebaseid",       url:"/policies/freebaseid", redirect:301},
  {prefix:"/signin/licensing",        url:"/policies/licensing", redirect:301},
  {prefix:"/signin/privacy",          url:"/policies/privacy", redirect:301},

  // View
  {prefix:"/view/filter",             url:"", redirect:301},
  {prefix:"/view/domain",             url:"", redirect:301},
  {prefix:"/view/image",              url:"", redirect:301},
  {prefix:"/view/document",           url:"", redirect:301},
  {prefix:"/view/usergroup",          url:"", redirect:301},
  {prefix:"/view/fb",                 url:"", redirect:301},
  {prefix:"/view/query",              url:"", redirect:301},
  {prefix:"/view/api/metaweb/view",   url:"", redirect:301},
  {prefix:"/view/guid/filter",        url:"", redirect:301},
  {prefix:"/view/help",               url:"", redirect:301},
  {prefix:"/view",                    url:"", redirect:301},
  {prefix:"/helptopic",               url:"", redirect:301},
  {prefix:"/iv/fb",                   url:"", redirect:301},

  // Other
  {prefix:"/view/userdomains",        url:"/domain/users", redirect:301},
  {prefix:"/newsfeed",                url:"/private/newsfeed", redirect:301}
];



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
        if (!app) {
          throw 'An app label must exist for: ' + route.app;
        }
        // replace route.app with actual app path
        route.app = app;
      }


      // Find the leaf node for this prefix and place the routing rule there
      var subtree = traverse_key_tree(routing_tree, route.prefix.split('/'), true);
      subtree.route = route;
      h.splice_with_key(route_list, "prefix", route);
    });
  };

  var route_for_path = this.route_for_path = function(path) {
    var subtree = traverse_key_tree(routing_tree, path.split('/'));
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
          var [script, path_info, qs] = rh.split_path(path_info);
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

  // add default routing rules
  this.add(rules);
};
