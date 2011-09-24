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

var h = acre.require("lib/helper/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");
var router_lib =   acre.require("lib/routing/router.sjs");

// Default codebase for this site - should map to trunk of SVN repository.
var site_codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var self = this;


function route(environment_rules) {
  var site_rules = init_site_rules(environment_rules.labels.lib);
  var rules = router_lib.extend_rules(site_rules, environment_rules);
  router_lib.route(rules, this);
};

function set_app(item, app_labels) {
  if (item.app) {
    var app = app_labels[item.app];
    if (!app) {
      throw 'An app label must exist for: ' + item.app;
    }
    item.app = app;
  }
  return item;
};


/**
 * Deal with the special case of routing /
 *   Note: to debug the homepage, use the /homepage prefix rule
 *         (e.g., /homepage?acre.console=1)
 */
function CustomRouter(app_labels) {
  var config;
  
  this.add = function(rules) {
    config = rules;
  };

  this.route = function(req) {    
    // only applies to homepage and "/browse"
    if ((req.path_info === "/browse") || 
        (req.path_info === "/" && !(
          ("props" in req.params) || ("links" in req.params) || ("ids" in req.params)
        ))) {
      var rule = {
        tabs: config["tabs"],
        more_tabs: config["more_tabs"]
      };
      
      [rule.tabs, rule.more_tabs].forEach(function(tabs) {
        tabs.forEach(function(item) {
          set_app(item, app_labels);
        });
      });
      
      acre.write(acre.require("template/freebase_object.sjs").main(rule, o));
      acre.exit();
    }

    return false;
  };

};

function ObjectRouter(app_labels) {
  var object_query = acre.require("queries/object.sjs");
  var freebase_object = acre.require("template/freebase_object.sjs");

  var route_list = [];
  var types = {};

  this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      [route.tabs, route.more_tabs, route.navs, route.promises].forEach(function(list) {
        list && list.forEach(function(item) {
          set_app(item, app_labels);
          item.promises && item.promises.forEach(function(p) {
            set_app(p, app_labels);
          });
          item.subnavs && item.subnavs.forEach(function(p) {
            set_app(p, app_labels);
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


function init_site_rules(lib) {

  var rules = {};

  rules["routers"] = [
    "host",
    ["custom", CustomRouter],
    "static",
    "ajax",
    "prefix",
    ["object", ObjectRouter]
  ];

  // Trunk labels for all apps in this site.
  // If you add a new app, you have to add it here first.

  rules["labels"] = {
    "lib":        "//lib" + site_codebase,

    "account":    "//account" + site_codebase,
    "activity":   "//activity" + site_codebase,
    "admin":      "//admin" + site_codebase,
    "appeditor":  "//appeditor" + site_codebase,
    "apps":       "//apps" + site_codebase,
    "create":     "//create" + site_codebase,
    "data":       "//data" + site_codebase,
    "devdocs":    "//devdocs" + site_codebase,
    "flag":       "//flag" + site_codebase,
    "group":      "//group" + site_codebase,
    "homepage":   "//homepage" + site_codebase,
    "policies":   "//policies" + site_codebase,
    "query":      "//query" + site_codebase,
    "sameas":     "//sameas" + site_codebase,
    "sample":     "//sample" + site_codebase,
    "schema":     "//schema" + site_codebase,
    "topic":      "//topic" + site_codebase,
    "triples":    "//triples" + site_codebase,
    "history":    "//history" + site_codebase
  };

  // Defaults to trunk lib if not specified.
  if (!lib) {
      lib = rules["labels"]["lib"];
  }

  // *********** PREFIX *************

  rules["prefix"] = [

    {prefix:"/browse",             app:"homepage"},
    {prefix:"/query",              app:"query"},
    {prefix:"/new",                app:"activity"},
    {prefix:"/docs",               app:"devdocs"},
    {prefix:"/appeditor",          app:"appeditor"},
    {prefix:"/policies",           app:"policies"},
    {prefix:"/account",            app:"account"},
    {prefix:"/favicon.ico",        app:"lib", script:"template/favicon.ico"},
    {prefix:"/sample",             app:"sample"},

    // Urls for administrative tools
    {prefix:"/admin",              app:"admin"},
    {prefix:"/app/tmt",            app:"tmt"},


    //
    // Redirects for legacy urls
    //
    
    // Homepage
    {prefix:"/index",                   url:"/", redirect: 301},
    {prefix:"/homepage",                url:"/browse", redirect: 301},

    // Domain activity browser
    {prefix:"/explore",                 url:"/browse", redirect:301},
    {prefix:"/view/mydomains",          url:"/browse", redirect:301},
    {prefix:"/site/data",               url:"/browse", redirect:301},
    {prefix:"/view/allDomains",         url:"/browse", redirect:301},
    {prefix:"/data",                    url:"/browse", redirect:301},
    {prefix:"/domain/users",            url:"/browse", redirect:301},

    // Signin & Account - TODO: use google URLs
    {prefix:"/signin/signin",           url:"/", redirect:301},
    {prefix:"/signin/signin.html",      url:"/", redirect:301},
    {prefix:"/signin/recoverPassword",  url:"/", redirect:301},
    {prefix:"/signin/recoverPassword3", url:"/", redirect:301},
    {prefix:"/private/account/activate",url:"/", redirect:301},
    {prefix:"/signin/app",              url:"/", redirect:301},
    {prefix:"/signin",                  url:"/", redirect:301},
    {prefix:"/view/account",            url:"/", redirect:301},
    {prefix:"/user/settings",           url:"/", redirect:301},
    {prefix:"/signin/recoverpassword",  url:"/", redirect:301},
    {prefix:"/signin/changepassword",   url:"/", redirect:301},
    {prefix:"/signin/activate",         url:"/", redirect:301},
    {prefix:"/signin/authorize_token",  url:"/", redirect:301},
    {prefix:"/search",                  url:"/", redirect:301},

    // Feedback
    {prefix:"/site/feedback",           url:"http://bugs.freebase.com", redirect:301},
    {prefix:"/view/feedback",           url:"http://bugs.freebase.com", redirect:301},
    {prefix:"/view/feedback_thanks",    url:"http://bugs.freebase.com", redirect:301},

    // Queryeditor
    {prefix:"/queryeditor",             url:"/query", redirect:301},
    {prefix:"/app/queryeditor",         url:"/query", redirect:301},
    {prefix:"/tools/queryeditor",       url:"/query", redirect:301},
    {prefix:"/view/queryeditor",        url:"/query", redirect:301},

    // Appeditor
    {prefix:"/tools/appeditor",         url:"/appeditor", redirect:301},

    // Review queue - TODO
    {prefix:"/tools/flags/review",      url:"",                    redirect:301},
    {prefix:"/tools/pipeline/home",     url:"/tools/flags/review", redirect:301},
    {prefix:"/tools/pipeline/showtask", url:"/tools/flags/review", redirect:301},

    // Policies
    {prefix:"/signin/tos",              url:"/policies/tos", redirect:301},
    {prefix:"/signin/cc",               url:"/policies/copyright", redirect:301},
    {prefix:"/signin/freebaseid",       url:"/policies/freebaseid", redirect:301},
    {prefix:"/signin/licensing",        url:"/policies/licensing", redirect:301},
    {prefix:"/signin/privacy",          url:"/policies/privacy", redirect:301},

    // Misc old client
    {prefix:"/view/search",             url:"/", redirect:301},
    {prefix:"/newsfeed",                url:"/", redirect:301},

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


    //
    // Redirects for old object views
    //
    {prefix:"/topic/",                  url:"/", redirect:301},

    {prefix:"/view/schema/",            url:"/", params:{schema:""}, redirect:301},
    {prefix:"/tools/schema/",           url:"/", params:{schema:""}, redirect:301},
    {prefix:"/type/schema/",            url:"/", params:{schema:""}, redirect: 301},

    {prefix:"/tools/explore/",          url:"/", params:{inspect:""}, redirect:301},
    {prefix:"/tools/explore2/",         url:"/", params:{inspect:""}, redirect:301},
    {prefix:"/inspect/",                url:"/", params:{inspect:""}, redirect:301},

    {prefix:"/view/history/",           url:"/", params:{history:""}, redirect:301},
    {prefix:"/history/user/",           url:"/", params:{history:""}, redirect:301},
    {prefix:"/history/topic/",          url:"/", params:{history:""}, redirect:301},
    {prefix:"/history/view/",           url:"/", params:{history:""}, redirect:301},

    {prefix:"/user/domains/",           url:"/", params:{domains:""}, redirect:301},
    {prefix:"/view/userdomains/",       url:"/", params:{domains:""}, redirect:301},

    {prefix:"/apps",                    url:"/new", params:{apps:""}},
    {prefix:"/apps/app/",               url:"/", redirect:301},
    {prefix:"/apps/",                   url:"/", redirect:301},

    {prefix:"/helptopic/",              url:"/", redirect:301},

    {prefix:"/discuss/threads/",        url:"/", redirect:301},
    {prefix:"/view/discuss/",           url:"/", redirect:301},
    {prefix:"/user/replies/",           url:"/", redirect:301},
    {prefix:"/view/mydiscuss/",         url:"/", redirect:301},
    {prefix:"/user/discuss/",           url:"/", redirect:301},

    {prefix:"/import/list/",            url:"/", redirect:301},
    {prefix:"/importer/list/",          url:"/", redirect:301},

    {prefix:"/edit/topic/",             url:"/", redirect:301},

    {prefix:"/view/filter/",            url:"/", redirect:301},
    {prefix:"/view/domain/",            url:"/", redirect:301},
    {prefix:"/view/image/",             url:"/", redirect:301},
    {prefix:"/view/document/",          url:"/", redirect:301},
    {prefix:"/view/usergroup/",         url:"/", redirect:301},
    {prefix:"/view/fb/",                url:"/", redirect:301},
    {prefix:"/view/query/",             url:"/", redirect:301},
    {prefix:"/view/api/metaweb/view/",  url:"/", redirect:301},
    {prefix:"/view/guid/filter/",       url:"/", redirect:301},
    {prefix:"/view/help/",              url:"/", redirect:301},
    {prefix:"/view/",                   url:"/", redirect:301},
    {prefix:"/iv/fb/",                  url:"/", redirect:301}

  ];


  // *********** OBJECT *************

  var h = acre.require(lib + "/helper/helpers.sjs");

  var DEFAULT_PROMISES = [
    {
      "key": "blurb",                 // the promise result will be stored in the object with this key
      "app": "site",                   // app containing the promise method
      "script": "queries/object.sjs", // script containing the promise method
      "promise": "blurb"              // promise method (passed object query result as arugment)
    }
  ];
  
  var DEFAULT_TABS = [
    {
      "name": "Properties",
      "key": "props",
      "app": "topic",
      "script": "topic.tab"
    },
    {
      "name": "Identifiers",
      "key": "ids",
      "app": "sameas",
      "script": "sameas.tab"
    },
    {
      "name": "Links",
      "key": "links",
      "app": "triples",
      "script": "triples.tab"
    }
  ];
  
  rules["custom"] = {
    tabs: [
      {
        "name": "Data",
        "key": "data",
        "app": "homepage",
        "script": "browse.tab"
      },
      {
        "name": "New Loads",
        "key": "loads",
        "app": "activity",
        "script": "new.tab"
      },
      {
        "name": "New Schema",
        "key": "schema",
        "app": "schema",
        "script": "new.tab"
      },
     {
       "name": "New Apps",
       "key": "apps",
       "app": "apps",
       "script": "new.tab"
     },
     {
       "name": "Review Queue",
       "key": "tasks",
       "app": "sample",
       "script": "empty_new.tab"
     }
    ],
    more_tabs: [
     {
       "name": "New Queries",
       "key": "queries",
       "app": "sample",
       "script": "empty_new.tab"
     },
     {
       "name": "New Users",
       "key": "users",
       "app": "sample",
       "script": "empty_new.tab"
     }
    ]
  };

  rules["object"] =  [
    {
      "type": "/freebase/apps/acre_app",
      "promises": h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "app"
      }]),
      "tabs": [
        {
          "name": "Versions",
          "key": "versions",
          "app": "sample",
          "script": "empty.tab"
        },
        {
          "name": "Editors",
          "key": "editors",
          "app": "group",
          "script": "group.tab"
        },
        {
          "name": "Writes",
          "key": "writes",
          "app": "activity",
          "script": "app.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "Edit Settings",
          "app": "admin",
          "ajax": "app_settings.mf.js",
          "auth": true // add "edit" class
        },
        {
          "name": "View source",
          "url": h.fb_url("/appeditor/#!app=${id}")
        }
      ]
    },
    {
      "type": "/type/domain",
      "promises":  h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "domain"
      }]),
      "tabs": [
        {
          "name": "Data",
          "key": "data",
          "app": "data",
          "script": "domain.tab"
        },
        {
          "name": "Schema",
          "key": "schema",
          "app": "schema",
          "script": "domain.tab"
        },
        {
          "name": "Editors",
          "key": "editors",
          "app": "group",
          "script": "group.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "Edit Settings",
          "app": "admin",
          "ajax": "domain_settings.mf.js",
          "auth": true // add "edit" class
        }
      ]
    },
    {
      "type": "/type/type",
      "promises":  h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "type"
      }]),
      "tabs": [
        {
          "name": "Topics",
          "key": "topics",
          "app": "data",
          "script": "type.tab"
        },
        {
          "name": "Schema",
          "key": "schema",
          "app": "schema",
          "script": "type.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "Edit Settings",
          "app": "admin",
          "ajax": "type_settings.mf.js",
          "auth": true // add "edit" class
        },
        {
          "name": "Build Query",
          "url": h.fb_url("/queryeditor?type=${id}")
        },
        {
          "name": "Add Topic",
          "key": "create",
          "app": "create",
          "script": "type.controller",
          "show": "can_create" // acre.require(app + "/" + script)[show](object_result) return TRUE to enable/show. FALSE to hide
        }
      ]
    },
    {
      "type": "/type/property",
      "promises":  [{
        "key": "blurb",
        "app": "site",
        "script": "queries/object.sjs",
        "promise": "documented_object_tip"
      },{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "property"
      }],
      "tabs": [
        {
          "name": "Schema",
          "key": "schema",
          "app": "schema",
          "script": "property.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
    },
    {
      "type": "/type/user",
      "promises":  h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "user"
      }]),
      "tabs": [
        {
          "name": "Schema",
          "key": "schema",
          "app": "data",
          "script": "user.tab"
        },
        {
          "name": "Queries",
          "key": "queries",
          "app": "query",
          "script": "user.tab"
        },
        {
          "name": "Apps",
          "key": "apps",
          "app": "apps",
          "script": "user.tab"
        },
        {
          "name": "Writes",
          "key": "writes",
          "app": "sample",
          "script": "empty.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "Edit Profile",
          "app": "admin",
          "ajax": "user_settings.mf.js",
          "auth": true // add "edit" class
        }
      ]
    },
    {
      "type": "/freebase/query",
      "promises": h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "freebase_query"
      },
      {
        "key": "query",
        "app": "site",
        "script": "queries/object.sjs",
        "promise": "query"
      }]),
      "tabs": [
        {
          "name": "Topics",
          "key": "topics",
          "app": "query",
          "script": "collection.tab"
        },
        {
          "name": "MQL",
          "key": "mql",
          "app": "query",
          "script": "mql.tab"
        }
      ],
      "more_tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "Edit Settings",
          "app": "admin",
          "ajax": "query_settings.mf.js",
          "auth": true // add "edit" class
        }
      ]
    },
    {
      "type": "/dataworld/mass_data_operation",
      "promises":  h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "mdo"
      }]),
      "tabs": [
        {
          "name": "Writes",
          "key": "activity",
          "app": "activity",
          "script": "mdo.tab"
        },
        {
          "name": "Properties",
          "key": "properties",
          "app": "topic",
          "script": "topic.tab"
        }
      ],
      "more_tabs": [
        {
          "name": "Identifiers",
          "key": "ids",
          "app": "sameas",
          "script": "sameas.tab"
        },
        {
          "name": "Links",
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        }
      ],
    },
    {
      "type": "/common/topic",
      "promises": [
        {
          "key": "notable_types",
          "app": "site",
          "script": "queries/object.sjs",
          "promise": "notable_types"
        },
        {
          "key": "breadcrumbs",
          "app": "lib",
          "script": "queries/breadcrumbs.sjs",
          "promise": "topic"
        }
      ],
      "tabs": h.extend(true, [], DEFAULT_TABS),
      "navs": [
        {
          "name": "<span class=\"submenu-title\">Flag Topic</span>",
          "subnavs": [{
            "name": "<b>Merge</b> with another topic",
            "onclick": "return window.freebase.flag.merge(this);"
          }, {
            "name": "<b>Split</b> into multiple topics",
            "onclick": "return window.freebase.flag.split(this);"
          }, {
            "name": "<b>Delete</b> from Freebase",
            "onclick": "return window.freebase.flag['delete'](this);"
          }, {
            "name": "<b>Flag</b> as objectionable",
            "onclick": "return window.freebase.flag.offensive(this);"
          }]
        }
      ]
    },
    {
      "type": "/type/object",
      "promises":  h.extend(true, [], DEFAULT_PROMISES).concat([{
        "key": "breadcrumbs",
        "app": "lib",
        "script": "queries/breadcrumbs.sjs",
        "promise": "object"
      }]),
      "tabs": h.extend(true, [], DEFAULT_TABS)
    }
  ];


  // *********** HOST *************

  rules["host"] = [
    {host:"freebase.com", url:"http://www.freebase.com"},
    {host:"sandbox-freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"sandbox.freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
    {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
    {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"metaweb.com", url:"http://www.freebase.com"},
    {host:"www.metaweb.com", url:"http://www.freebase.com"}
  ];

  return rules;
}
