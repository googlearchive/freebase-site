/**
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

// Default codebase - should map to trunk of SVN repository.
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";

var topscope = this.__proto__;
var scope = this;

// fix acre.freebase.site_host to reflect the current acre.reqest.protocol
if (acre.request.protocol === "https" &&
    acre.freebase.site_host.indexOf("http://") === 0) {
    acre.freebase.site_host = acre.freebase.site_host.replace("http://", "https://");
};

var h = acre.require("helper/helpers.sjs");
var validators = acre.require("validator/validators.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var _ = i18n.gettext;
var object_query = acre.require("queries/object.sjs");
var freebase_object = acre.require("template/object.sjs");

/**
 * RULES
 */
function init_rules(lib) {

  var rules = {};

  rules["routers"] = [
    "host",
    "custom",
    "static",
    "ajax",
    "prefix",
    "object"
  ];

  // Trunk labels for all apps in this site.
  // If you add a new app, you have to add it here first.

  rules["labels"] = {
    "lib":        "//lib" + codebase,

    "account":    "//account" + codebase,
    "appeditor":  "//appeditor" + codebase,
    "apps":       "//apps" + codebase,
    "create":     "//create" + codebase,
    "data":       "//data" + codebase,
    "formbuilder":"//formbuilder" + codebase,
    "i18n":       "//i18n" + codebase,
    "mdo":        "//mdo" + codebase,
    "policies":   "//policies" + codebase,
    "query":      "//query" + codebase,
    "review":     "//review" + codebase,
    "sameas":     "//sameas" + codebase,
    "sample":     "//sample" + codebase,
    "schema":     "//schema" + codebase,
    "topic":      "//topic" + codebase,
    "triples":    "//triples" + codebase,
    "users":      "//users" + codebase
  };

  // Defaults to trunk lib if not specified.
  if (!lib) {
    lib = rules["labels"]["lib"];
  }

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
    {host:"metaweb.com", url:"http://www.freebase.com"},
    {host:"www.metaweb.com", url:"http://www.freebase.com"}
  ];


  // ********* CUSTOM (browse) *********
  rules["custom"] = {
    promises: [{
      "key": "total_topics",
      "app": "lib",
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

  var DEFAULT_GEAR = [
    {
      "name": _("<b>Discuss</b>"),
      "app": "lib",
      "script": "discuss/discuss.mf.js",
      "method": "discuss.toggle_discuss",
      "args": (function() { return [this.object.mid]; })
    }
  ];

  var DEFAULT_MORE_TABS = [
    {
      "name": _("Properties"),
      "key": "props",
      "app": "topic",
      "script": "topic.tab",
      "more": true
    },
    {
      "name": _("I18n"),
      "key": "i18n",
      "app": "i18n",
      "script": "i18n.tab",
      "more": true
    },
    {
      "name": _("Keys"),
      "key": "keys",
      "app": "sameas",
      "script": "sameas.tab",
      "more": true
    },
    {
      "name": _("Links"),
      "key": "links",
      "app": "triples",
      "script": "triples.tab",
      "more": true
    }
  ];

  var DEFAULT_MORE_TABS_WITHOUT_I18N = DEFAULT_MORE_TABS.filter(function(tab) {
    return tab.key !== "i18n";
  });

  // The yellow-strip banner above the object masthead.
  var DEFAULT_BANNERS = [{
    "key": "banners",
    "app": "lib",
    "script": "queries/object.sjs",
    "promise": "get_object_banners"
  }];

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
          "name": _("Writes"),
          "key": "writes",
          "app": "triples",
          "script": "writes.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Domain"),
      "type": "/type/domain",
      "properties": [
        "/freebase/domain_profile/category"
      ],
      "promises": h.extend(true, [], DEFAULT_BANNERS),
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
          "name": _("I18n"),
          "key": "i18n",
          "app": "i18n",
          "script": "i18n.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS_WITHOUT_I18N)),
      "gear": [
        {
          "name": _("Documentation"),
          "url": (function() { return h.wiki_url("Commons"+this.object.id); })
        },
        {
          "name": _("<b>Delete</b> Domain"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_domain_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Type"),
      "type": "/type/type",
      "properties": [
        "/type/type/domain", 
        "/freebase/type_hints/deprecated",
        "/freebase/type_hints/mediator",
        "/freebase/type_hints/enumeration",
        "/freebase/type_hints/never_assert"
      ],
      "promises": h.extend(true, [], DEFAULT_BANNERS),
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
          "name": _("I18n"),
          "key": "i18n",
          "app": "i18n",
          "script": "i18n.tab"
        },
        {
          "name": _("Add Topic"),
          "key": "create",
          "app": "create",
          "script": "type.controller",
          "hidden": true
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS_WITHOUT_I18N)),
      "nav_keys": [
        {
          "label": _("domain"),
          "key": (function() {
            return object_query.get_first_value(this.object, "/type/type/domain").id;
          }),
          "url": (function() {
            var id = object_query.get_first_value(this.object, "/type/type/domain").id;
            return h.fb_url(id, [['schema']]);
          })
        }
      ],
      "gear": [
        {
          "name": _("Build Query"),
          "url": (function() { return h.build_query_url(null, this.object.id); })
        },
        {
          "name": _("Add Topic"),
          "url": (function() { return h.fb_url(this.object.id, [['create']]); }),
          "app": "create",
          "script": "type.controller",
          "show": "can_create"
        },
        {
          "name": _("Documentation"),
          "url": (function() { return h.wiki_url("Commons"+this.object.id); })
        },
        {
          "name": _("<b>Delete</b> Type"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_type_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Property"),
      "type": "/type/property",
      "properties": [
        "/type/property/schema",
        "/freebase/property_hints/deprecated",
        "/type/property/requires_permission",
        "/freebase/property_hints/disambiguator",
        "/freebase/property_hints/display_none",
        "/type/property/delegated"
      ],
      "promises": h.extend(true, [], DEFAULT_BANNERS),
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
        },
        {
          "name": _("I18n"),
          "key": "i18n",
          "app": "i18n",
          "script": "i18n.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS_WITHOUT_I18N)),
      "nav_keys": [
        {
          "label": _("type"),
          "key": (function() {
            return object_query.get_first_value(this.object, "/type/property/schema").id;
          }),
          "url": (function() {
            var id = object_query.get_first_value(this.object, "/type/property/schema").id;
            return h.fb_url(id, [['schema']]);
          })
        }
      ],
      "gear": [
        {
          "name": _("Build Query"),
          "url": (function() { return h.build_query_url(null, null, this.object.id); })
        },
        {
          "name": _("Documentation"),
          "url": (function() { return h.wiki_url("Commons"+this.object.id); })
        },
        {
          "name": _("<b>Delete</b> Property"),
          "app": "lib",
          "script": "schema/schema.mf.js",
          "method": "schema.delete_property_begin",
          "args": (function() { return [this.object.id]; }),
          "auth": true // add "edit" class if authorized to delete the domain
        }
      ].concat(h.extend(true, [], DEFAULT_GEAR))
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
        "app": "lib",
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
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Usergroup"),
      "type": "/type/usergroup",
      "tabs": [
        {
          "name": _("Members"),
          "key": "members",
          "app": "users",
          "script": "group.tab"
        }
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Permission"),
      "type": "/type/permission",
      "tabs": [
        {
          "name": _("Members"),
          "key": "members",
          "app": "users",
          "script": "group.tab"
        },
        {
          "name": _("Properties"),
          "key": "props",
          "app": "topic",
          "script": "topic.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        }
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
    },
    {
      "name": _("Query"),
      "type": "/freebase/query",
      "properties": [
        "/common/document/text"
      ],
      "promises": [{
        "key": "query",
        "app": "lib",
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
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ].concat(h.extend(true, [], DEFAULT_MORE_TABS)),
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
          "name": _("I18n"),
          "key": "i18n",
          "app": "i18n",
          "script": "i18n.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        }
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
            "name": _("I18n"),
            "key": "i18n",
            "app": "i18n",
            "script": "i18n.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
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
        }
      ].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
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
          "name": _("I18n"),
          "key": "i18n",
          "app": "i18n",
          "script": "i18n.tab"
        },
        {
          "name": _("Keys"),
          "key": "keys",
          "app": "sameas",
          "script": "sameas.tab"
        },
        {
          "name": _("Links"),
          "key": "links",
          "app": "triples",
          "script": "triples.tab"
        }
      ],
      "gear": [].concat(h.extend(true, [], DEFAULT_GEAR))
    }
  ];


  // *********** PREFIX *************

  rules["prefix"] = [

    {prefix:"/query",              app:"query", script:"editor.template"},
    {prefix:"/appeditor",          app:"appeditor"},
    {prefix:"/policies",           app:"policies"},
    {prefix:"/account",            app:"account"},
    {prefix:"/favicon.ico",        app:"lib", script:"template/img/favicon.ico"},
    {prefix:"/sample",             app:"sample"},
    {prefix:"/suggest",            app:"lib", script:"suggest"},
    {prefix:"/robots.txt",         app:"lib", script:"routing/robots.sjs"},

    {prefix:"/flyout",             app:"lib", script:"flyout/flyout.controller"},
    {prefix:"/formbuilder",        app:"formbuilder", 
                                   script:"formbuilder.controller"},

    {prefix:"/account/claim",      app:"account", script:"claim.controller"},
    {prefix:"/account/reconnect",  app:"account", script:"reconnect.controller"},


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

/**
* Extend the default rules for this site with the environment specific rules.
*/
function extend_rules(rules, environment_rules) {
  // Here we handle configuration overrides from specific environments.

  // Labels environment override.
  if (environment_rules["labels"]) {
    if (!("labels" in rules)) rules["labels"] = {};
    h.extend(rules["labels"], environment_rules["labels"]);
  }

  // Prefix environment override.
  if (environment_rules["prefix"]) {
    if (!("prefix" in rules)) rules["prefix"] = [];

    // Holds prefix -> index in prefix routing array.
    var prefix_index = {};
    rules["prefix"].forEach(function(route, i) {
      if (!route["prefix"]) {
        throw("You can not define a prefix routing rule without a prefix.");
        exit(-1);
      }
      prefix_index[route.prefix] = i;
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

  // Util override
  if (environment_rules["util"]) {
    h.extend(rules["util"], environment_rules["util"]);
  }

  // only want one set of routers
  rules["routers"] = environment_rules["routers"] || rules["routers"];

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



/**
 * ROUTERS
 */
var routers_map = {
  "host"   : HostRouter,
  "prefix" : PrefixRouter,
  "static" : StaticRouter,
  "ajax"   : AjaxRouter,
  "test"   : TestRouter,
  "custom" : CustomRouter,
  "object" : ObjectRouter
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

function is_proxyable(app_path, scope) {
  var md = acre.get_metadata();

  // is it in the same project?
  if ((app_path == "//" + md.project) ||
      h.endsWith(app_path, "." + md.project)) {
    return true;
  }

  // is it a proxy-able project?
  if (md.proxy) {
    for (var proxy_site in md.proxy) {
      if (h.endsWith(app_path, "." + md.proxy[proxy_site])) {
        return true;
      }
    }
  }

  // is it one of our mounted apps?
  for (var mount in md.mounts) {
    var path = md.mounts[mount];
    if (path === app_path) {
      return true;
    }
  }

  // no? then bail
  return false;
}


/**
 * If context is TRUE, do an acre.include instead of acre.route,
 * so that we do not lose the context of the original request include oauth credentials.
 */
function route_path(path, context, scope, md) {
   if (context) {
    scope = scope || this;
    var content = acre.include.call(scope, path, md);
    var headers = content.headers;
    if (headers) {
      for (var k in headers) {
        acre.response.set_header(k, headers[k]);
      }
    }
    if (content.status) {
      acre.response.status = content.status;
    }
    if (content.toString() !== "undefined") {
      acre.write(content);
    }
  }
  else {
    acre.route(path);
  }
  acre.exit();
};

function StaticRouter() {
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
    route_path(path, true);
  };
};


function AjaxRouter() {
  var route = this.route = function(req, scope) {
    var qs = req.query_string;
    var segs = req.path_info.split("/");
    segs.shift();

    // only handle /ajax URLs
    if (segs.shift() !== "ajax") {
      return false;
    }

    // only proxy if it's in a mounted app
    if (!is_proxyable("//" + segs[0], scope)) {
      return false;
    }

    var path = "//" + segs.join("/") + (qs ? "?" + qs : "");
    route_path(path, true);
  };
};

/**
   ---- Test script router ---
   Used for running tests:

   /test/[test app host]/[test path]
 */
function TestRouter(rules) {
  var route = this.route = function(req, scope) {
    var qs = req.query_string;
    var segs = req.path_info.split("/");
    segs.shift();

    // only handle /test URLs
    if (segs.shift() !== "test") {
      return false;
    }

    var test_path = "//test" + codebase + "/" + segs.join("/") + (qs ? "?" + qs : "");
    var test_labels = {};
    for (var label in rules.labels) {
      test_labels["label/" + label] = rules.labels[label];
    }
    route_path(test_path, true, null, {"mounts": test_labels});
  };
};


/**
   ---- Utility script router ---
   Used when a script needs access to routing rules
   after they've been processed by other routers
   (e.g., test introspection or cache warmers).

   Utility scripts are assumed to be at the root and
   start with '_'.
 */

function UtilRouter(rules) {
  var utils;

  var add = this.add = function(u) {
    utils = u || {};
  };

  var route = this.route = function(req, scope) {
    var m = req.path_info.match(/\/\_(.*)/);
    var util = m ? utils[m[1]] : null;
    if(!util) {
      return false;
    }
    scope.rules = rules;
    route_path(util, true, scope);
  };

  var dump = this.dump = function() {
    return h.extend({}, utils);
  };
};


/**
   ----Prefix routing logic for Acre---
   1. Add routes with router.add({prefix:, app:, script:?, redirect:?, url:?})
      there can only be one route per exact prefix
      there can only be one route per app, script combo
   2. Find the route for request path with router.route_for_path(path)
 */
function PrefixRouter(rules) {
  var app_labels = rules.labels;
  var route_list = [];
  var routing_tree = {};

  // check cache for routing tables based on version of environments
  var cached = false;
  var env_md = acre.get_metadata(acre.request.script.path);
  var cache_key = env_md.content_hash + ":prefix_routes";
  var routes = acre.cache.get(cache_key);
  if (routes) {
    cached = true;
    route_list = routes.route_list;
    routing_tree = routes.routing_tree;
  }

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
          if (current_tree['key-/']) {
            current_tree = current_tree['key-/'];
          }
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
    if (!cached) {
      acre.cache.put(cache_key, {
        route_list: route_list,
        routing_tree: routing_tree
      })
    }
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
        route_path([
            rule.app,
            "/",
            script,
            path_info,
            (query_string ? "?" + query_string : "")
        ].join(""));
      }
    }
    return false;
  };

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
function CustomRouter(rules) {
  var app_labels = rules.labels;
  var rule, route_map;

  this.add = function(rules) {
    rule = rules;
    route_map = h.map_array(rule.tabs, "path");
  };

  this.route = function(req) {

    // redirect custom hosts for bases
    var site_host = h.parse_uri(acre.freebase.site_host).host;
    var site_parts = site_host.split(".");
    var req_parts = req.server_name.split(".");
    if ((site_parts.length === 3) && (req_parts.length === 3) 
        && (req_parts[1] === site_parts[1]) && (req_parts[2] === site_parts[2])) {
      // don't route site host
      if ((req_parts[0] === site_parts[0]) || (req_parts[0] === "devel")) {
        // no op
      }
      // special-case RDF service
      else if (req_parts[0] === "rdf") {
        var id = acre.request.path_info.replace(/^\/(ns|rdf)/, "").replace(".", "/");
        h.redirect(scope, acre.freebase.googleapis_url + "/rdf" + id);
      }
      // otherwise, assume it's a custom base hostname
      else if (req_parts[0].length >= 5) {
        h.redirect(scope, "//" + site_host + "/base/" + req_parts[0]);
      }
    }

    // handle homepage and "/browse"
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

  this.route = function(req, scope) {

    var path_info = req.path_info;

    var req_id = validators.MqlId(path_info, {if_invalid:null});

    if (req_id) {

      var o;
      var error;
      var d = object_query.object(req_id, properties)
        .then(function(obj) {
          o = obj;
        }, function(err) {
          error = err;
        });
      acre.async.wait_on_results();

      // Error
      if (error) {
        var TopicAPIError = acre.require("queries/topic.sjs").TopicAPIError;
        throw new TopicAPIError(error);
      }
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


function route(environment_rules) {
  // Make sure dateline cookie gets set with same options as account cookie
  acre.freebase.set_cookie_options(h.account_cookie_options());

  var base_rules = init_rules(environment_rules.labels.lib);
  var rules = extend_rules(base_rules, environment_rules);
  
  // Explicitly set the error and not_found pages
  var lib_md = acre.get_metadata();
  var not_found_path = acre.resolve(lib_md.not_found_page);
  var error_page_path = acre.resolve(lib_md.error_page);
  acre.response.set_error_page(error_page_path);

  function do_router(router_info) {
    var name = router_info[0];
    var router_class = router_info[1];
    var router = new router_class(rules);
    var rule = rules[name];
    if (router.add) {
      router.add(rule);
    }
    if (is_util && router.dump) {
      rules.dumped_rules[name] = router.dump();
    }
    else {
      router.route(scope.acre.request, scope);
    }
  };

  // For utility scripts, still run all routers
  // to get the dumped rules, then run UtilRouter 
  var is_util = (scope.acre.request.path_info.indexOf("/_") == 0);
  if (is_util) {
    rules.dumped_rules = {};
  }

  var routers = rules["routers"];
  routers.forEach(do_router);

  if (is_util) {
    is_util = false;
    do_router(["util", UtilRouter]);
  }

  // No routing rule handled the request, so render not found page
  acre.response.status = 404;
  acre.write(acre.include(not_found_path));
  acre.exit();
};
