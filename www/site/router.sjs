/*
 * Copyright 2012, Google Inc.
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
var i18n = acre.require("lib/i18n/i18n.sjs");
var _ = i18n.gettext;
var validators = acre.require("lib/validator/validators.sjs");
var router_lib =   acre.require("lib/routing/router.sjs");
var object_query = acre.require("queries/object.sjs");
var freebase_object = acre.require("template/object.sjs");


// Default codebase for this site - should map to trunk of SVN repository.
var site_codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var self = this;


function route(environment_rules) {
  // Make sure dateline cookie gets set with same options as account cookie
  acre.freebase.set_cookie_options(h.account_cookie_options());

  var site_rules = init_site_rules(environment_rules.labels.lib);
  var rules = router_lib.extend_rules(site_rules, environment_rules);
  router_lib.route(rules, this);
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
    "appeditor":  "//appeditor" + site_codebase,
    "apps":       "//apps" + site_codebase,
    "create":     "//create" + site_codebase,
    "data":       "//data" + site_codebase,
    "mdo":        "//mdo" + site_codebase,
    "policies":   "//policies" + site_codebase,
    "query":      "//query" + site_codebase,
    "review":     "//review" + site_codebase,
    "sameas":     "//sameas" + site_codebase,
    "sample":     "//sample" + site_codebase,
    "schema":     "//schema" + site_codebase,
    "topic":      "//topic" + site_codebase,
    "triples":    "//triples" + site_codebase,
    "users":      "//users" + site_codebase
  };

  // Defaults to trunk lib if not specified.
  if (!lib) {
    lib = rules["labels"]["lib"];
  }
  var site = acre.current_script.app.path;

  // *********** UTIL *************
  rules["util"] = {
    fs_routing: lib + "/routing/rules_dump.sjs",
    schema_warmer: lib + "/schema/warmer.controller",
    script_warmer: lib + "/scripts/warmer.controller"
  };


  // *********** HOST *************

  rules["host"] = [
    {host:"sandbox.freebase.com", url:"http://sandbox-freebase.com"},
    {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
    {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
    {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"metaweb.com", url:"http://www.freebase.com"},
    {host:"www.metaweb.com", url:"http://www.freebase.com"}
  ];


  // ********* CUSTOM (browse) *********
  rules["custom"] = {
    promises: [{
      "key": "total_topics",
      "app": "site",
      "script": "queries/object.sjs",
      "promise": "topic_count"
    }],
    tabs: [
      {
        "name": _("Data"),
        "path": "/browse",
        "app": "data",
        "script": "browse.tab"
      },
      {
        "name": _("Schema"),
        "path": "/schema",
        "app": "schema",
        "script": "browse.tab"
      },
      {
        "name": _("Queries"),
        "path": "/queries",
        "app": "query",
        "script": "browse.tab"
      },
      {
        "name": _("Apps"),
        "path": "/apps",
        "app": "apps",
        "script": "browse.tab"
      },
      {
        "name": _("Loads"),
        "path": "/loads",
        "app": "mdo",
        "script": "browse.tab"
      },
      {
        "name": _("Review Tasks"),
        "path": "/tasks",
        "app": "review",
        "script": "browse.tab"
      },
      {
        "name": _("Users"),
        "path": "/users",
        "app": "users",
        "script": "browse.tab"
      }
    ]
  };


  // *********** OBJECT *************

  var DEFAULT_MORE_TABS = [
    {
      "name": _("Properties"),
      "key": "props",
      "app": "topic",
      "script": "topic.tab",
      "more": true
    },
    {
      "name": _("Links"),
      "key": "links",
      "app": "triples",
      "script": "triples.tab",
      "more": true
    }, 
    {
      "name": _("Keys"),
      "key": "keys",
      "app": "sameas",
      "script": "sameas.tab",
      "more": true
    }
  ];

  rules["object"] =  [
    {
      "name": _("App"),
      "type": "/freebase/apps/acre_app",
      "tabs": [
        {
          "name": _("Versions"),
          "key": "versions",
          "app": "apps",
          "script": "versions.tab"
        },
        {
          "name": _("Editors"),
          "key": "editors",
          "app": "users",
          "script": "group.tab"
        },
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("App"),
      "type": "/dataworld/software_tool",
      "tabs": [
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Domain"),
      "type": "/type/domain",
      "tabs": [
        {
          "name": _("Data"),
          "key": "data",
          "app": "data",
          "script": "domain.tab"
        },
        {
          "name": _("Queries"),
          "key": "queries",
          "app": "query",
          "script": "domain.tab"
        },
        {
          "name": _("Schema"),
          "key": "schema",
          "app": "schema",
          "script": "domain.tab"
        },
        {
          "name": _("Editors"),
          "key": "editors",
          "app": "users",
          "script": "group.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [
        {
          "name": _("<b>Discuss</b> Domain"),
          "url": (function() { return h.legacy_fb_url("/discuss/threads", this.object.id); })
        },
        {
          "name": _("<b>Delete</b> Domain"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_domain_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ]
    },
    {
      "name": _("Type"),
      "type": "/type/type",
      "properties": [
        "/type/type/domain"
      ],
      "tabs": [
        {
          "name": _("Schema"),
          "key": "schema",
          "app": "schema",
          "script": "type.tab"
        },
        {
          "name": _("Instances"),
          "key": "instances",
          "app": "data",
          "script": "type.tab"
        },
        {
          "name": _("Add Topic"),
          "key": "create",
          "app": "create",
          "script": "type.controller",
          "hidden": true
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "nav_keys": [
        {
          "label": _("domain"),
          "key": (function() { 
            return object_query.get_first_value(this.object.props["/type/type/domain"]).id;
          }),
          "url": (function() { 
            var id = object_query.get_first_value(this.object.props["/type/type/domain"]).id;
            return h.fb_url(id, [['schema']]); 
          })
        }
      ],
      "gear": [
        {
          "name": _("Build Query"),
          "url": (function() { return h.fb_url("/queryeditor", {type: this.object.id}); })
        },
        {
          "name": _("Add Topic"),
          "url": (function() { return h.fb_url(this.object.id, [['create']]); }),
          "app": "create",
          "script": "type.controller",
          "show": "can_create"
        },
        {
          "name": _("<b>Delete</b> Type"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_type_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ]
    },
    {
      "name": _("Property"),
      "type": "/type/property",
      "properties": [
        "/type/property/schema"
      ],
      "tabs": [
        {
          "name": _("Schema"),
          "key": "schema",
          "app": "schema",
          "script": "property.tab"
        },
        {
          "name": _("Instances"),
          "key": "instances",
          "app": "triples",
          "script": "property.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "nav_keys": [
        {
          "label": _("type"),
          "key": (function() { 
            return object_query.get_first_value(this.object.props["/type/property/schema"]).id;
          }),
          "url": (function() { 
            var id = object_query.get_first_value(this.object.props["/type/property/schema"]).id;
            return h.fb_url(id, [['schema']]); 
          })
        }
      ],
      "gear": [
        {
          "name": _("<b>Delete</b> Property"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_property_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ]
    },
    {
      "name": _("User"),
      "type": "/type/user",
      "properties": [
        "/type/user/usergroup"
      ],
      "show_image": true,
      "promises":  [{
        "key": "user_badge",
        "app": "site",
        "script": "queries/object.sjs",
        "promise": "get_user_badge"
      }],
      "tabs": [
        {
          "name": _("Schema"),
          "key": "schema",
          "app": "data",
          "script": "user.tab"
        },
        {
          "name": _("Queries"),
          "key": "queries",
          "app": "query",
          "script": "user.tab"
        },
        {
          "name": _("Apps"),
          "key": "apps",
          "app": "apps",
          "script": "user.tab"
        },
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [
        {
          "name": _("<b>Discuss</b> with this user"),
          "url": (function() { return h.legacy_fb_url("/discuss/threads", this.object.id); })
        }
      ]
    },
    {
      "name": _("Usergroup"),
      "type": "/type/usergroup",
      "tabs": [
        {
          "name": _("Editors"),
          "key": "editors",
          "app": "users",
          "script": "group.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Query"),
      "type": "/freebase/query",
      "properties": [
        "/common/document/text"
      ],
      "promises": [{
        "key": "query",
        "app": "site",
        "script": "queries/object.sjs",
        "promise": "get_query"
      }],
      "tabs": [
        {
          "name": _("Data"),
          "key": "data",
          "app": "query",
          "script": "collection.tab"
        },
        {
          "name": _("MQL"),
          "key": "mql",
          "app": "query",
          "script": "mql.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Dataset"),
      "type": "/dataworld/information_source",
      "tabs": [
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Load"),
      "type": "/dataworld/mass_data_operation",
      "tabs": [
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Attribution"),
      "type": "/type/attribution",
      "tabs": [
        {
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS))
    },
    {
      "name": _("Namespace"),
      "type": "/type/namespace",
      "tabs": [
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        },
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        }
      ]
    },
    {
      "name": _("Topic"),
      "type": "/common/topic",
      "use_mid": true,
      "show_image": true,
      "tabs": [
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab",
        }        
      ],
      "nav_keys": [
        {
          "if": function() { 
              return this.object.notability && this.object.notability.notable_type;
          },
          "label": _("notable type"),
          "key": function() { 
              return this.object.notability.notable_type.id; 
          },
          "url": function() {
              return h.fb_url(this.object.notability.notable_type.id, [['schema']]); 
          }
        },
        {
          "if": function() { 
              return this.object.notability && this.object.notability.notable_for; 
          },
          "label": _("notable for"),
          "key": function() { 
              return this.object.notability.notable_for.id;
          },
          "url": function() { 
              return h.fb_url(this.object.notability.notable_for.id, [['schema']]); 
          }
        }
      ],
      "gear": [
        {
          "name": _("<span class=\"submenu-title\">Flag Topic</span>"),
          "subnavs": [{
            "name": _("<b>Merge</b> with another topic"),
            "onclick": "return window.freebase.flag.merge(this);"
          }, {
            "name": _("<b>Split</b> into multiple topics"),
            "onclick": "return window.freebase.flag.split(this);"
          }, {
            "name": _("<b>Delete</b> from Freebase"),
            "onclick": "return window.freebase.flag['delete'](this);"
          }, {
            "name": _("<b>Flag</b> as objectionable"),
            "onclick": "return window.freebase.flag.offensive(this);"
          }]
        },
        {
          "name": _("<b>Discuss</b> Topic"),
          "url": (function() { return h.legacy_fb_url("/discuss/threads", this.object.id); })
        },
        {
          "name": _("<b>Edit</b> on old site"),
          "url": (function() { return h.legacy_fb_url("/edit/topic", this.object.id); })
        }
      ]
    },
    {
      "name": _("Image"),
      "type": "/common/image",
      "tabs": [
        {
          "name": _("Content"),
          "key": "content",
          "app": "topic",
          "script": "content.tab"
        },
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        }
      ]
    },
    {
      "name": _("Article"),
      "type": "/common/document",
      "tabs": [
        {
          "name": _("Content"),
          "key": "content",
          "app": "topic",
          "script": "content.tab"
        },
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        }
      ]
    },
    {
      "name": _("Content"),
      "type": "/type/content",
      "tabs": [
        {
          "name": _("Content"),
          "key": "content",
          "app": "topic",
          "script": "content.tab"
        },
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        }
      ]
    },
    {
      "name": _("Object"),
      "type": "/type/object",
      "tabs": [
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        },
        
      ]
    }
  ];


  // *********** PREFIX *************

  rules["prefix"] = [

    {prefix:"/query",              app:"query", script:"editor.template"},
    {prefix:"/appeditor",          app:"appeditor"},
    {prefix:"/policies",           app:"policies"},
    {prefix:"/account",            app:"account"},
    {prefix:"/favicon.ico",        app:"lib", script:"template/favicon.ico"},
    {prefix:"/sample",             app:"sample"},
    {prefix:"/suggest",            app:"lib", script:"suggest"},
    {prefix:"/robots.txt",         app:"site", script:"robots.sjs"},

    {prefix:"/flyout",             app:"lib", script:"flyout/flyout.controller"},

    {prefix:"/account/claim",      app:"account", script:"claim.controller"},

    //
    // Redirects for legacy urls
    //

    // Review queue
    {prefix:"/review",       app:"review", script:"queue.controller"},    

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
    {prefix:"/docs",                    url:"http://wiki.freebase.com", redirect:301},
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

    {prefix:"/view/schema/",            url:"/", params:{schema:""},  redirect:301},
    {prefix:"/tools/schema/",           url:"/", params:{schema:""},  redirect:301},
    {prefix:"/type/schema/",            url:"/", params:{schema:""},  redirect: 301},

    {prefix:"/tools/explore/",          url:"/", params:{links:""},   redirect:301},
    {prefix:"/tools/explore2/",         url:"/", params:{links:""},   redirect:301},
    {prefix:"/inspect/",                url:"/", params:{links:""},   redirect:301},

    {prefix:"/view/history/",           url:"/", params:{links:""},   redirect:301},
    {prefix:"/history/user/",           url:"/", params:{writes:""},  redirect:301},
    {prefix:"/history/topic/",          url:"/", params:{links:""},   redirect:301},
    {prefix:"/history/view/",           url:"/", params:{links:""},   redirect:301},

    {prefix:"/user/domains/",           url:"/", params:{domains:""}, redirect:301},
    {prefix:"/view/userdomains/",       url:"/", params:{domains:""}, redirect:301},

    {prefix:"/apps",                    url:"/apps"},
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

  return rules;
}


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
function CustomRouter(rules) {
  var app_labels = rules.labels;
  var rule, route_map;

  this.add = function(rules) {
    rule = rules;
    route_map = h.map_array(rule.tabs, "path");
  };

  this.route = function(req) {
    // only applies to homepage and "/browse"
    if ((req.path_info in route_map) ||
        (req.path_info === "/" && !(
          ("props" in req.params) || ("links" in req.params) || ("ids" in req.params)
        ))) {

      rule.tabs.forEach(function(item) {
        set_app(item, app_labels);
        item.promises && item.promises.forEach(function(p) {
          set_app(p, app_labels);
        });
      });

      rule.promises.forEach(function(item) {
        set_app(item, app_labels);
      });

      acre.write(acre.require("template/object.sjs").main(rule, o));
      acre.exit();
    }

    return false;
  };

};

function ObjectRouter(rules) {
  var app_labels = rules.labels;

  var route_list = [];
  var types = {};
  var properties = [];

  this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      if (route.properties) {
        properties = properties.concat(route.properties);
      }
      [route.tabs, route.gear, route.promises].forEach(function(list) {
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
      var d = object_query.object(req_id, properties)
        .then(function(obj) {
          o = obj;
        });
      acre.async.wait_on_results();

      // No object found
      if (!o) return false;

      // Find correct rule for this object
      var rule, i, l;
      for (i=0,l=route_list.length; i<l; i++) {
        var route = route_list[i];
        var type = route.type;
        if (o.type_map[type]) {
          // clone tabs spec so we don't overwrite it
          rule = h.extend(true, {}, route);
          break;
        }
      }
      if (!rule) {
        throw "Missing rule configuration for this object";
      }

      // Special case guid IDs to not redirect
      if (req_id.indexOf("/guid/") === 0) {
        o.id = req_id;
      }
      // Redirect topics that have been merged
      else if (o.replaced_by) {
        return h.redirect(self, o.replaced_by.id);
      }
      // For topics and some other types, we always to force mids
      else if (rule.use_mid) {
        o.id = o.mid;
      }

      acre.write(freebase_object.main(rule, o));
      acre.exit();
    }
  };

  var dump = this.dump = function() {
    return route_list.slice();
  };

};
