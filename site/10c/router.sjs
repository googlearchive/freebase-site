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

var router =   acre.require("lib/routing/router.sjs");

function route(environment_rules) {
  var site_rules = init_site_rules(environment_rules.labels.lib);
  var rules = router.extend_rules(site_rules, environment_rules);
  router.route(rules, this);
};

// Default codebase for lib (this is the freebase-site SVN repository).
var lib_codebase = ".www.trunk.svn.freebase-site.googlecode.dev";

// Default codebase for this site - should map to trunk of SVN repository.
var site_codebase = ".www.trunk.svn.freebase-site.googlecode.dev";


function init_site_rules(lib) {
  
    var rules = {};
    
    // Trunk labels for all apps in this site. 
    // If you add a new app, you have to add it here first.

    rules["labels"] = {
        "lib":        "//lib" + lib_codebase,
        
        "account":    "//account" + site_codebase,
        "activity":   "//activity" + site_codebase,
        "admin":      "//admin" + site_codebase,
        "appeditor":  "//appeditor" + site_codebase,
        "apps":       "//apps" + site_codebase,
        "create":     "//create" + site_codebase,
        "data":       "//data" + site_codebase,
        "devdocs":    "//devdocs" + site_codebase,
        "group":      "//group" + site_codebase,
        "homepage":   "//homepage" + site_codebase,
        "policies":   "//policies" + site_codebase,
        "query":      "//query" + site_codebase,
        "sameas":     "//sameas" + site_codebase,
        "sample":     "//sample" + site_codebase,
        "schema":     "//schema" + site_codebase,
        "topic":      "//topic" + site_codebase,
        "triples":    "//triples" + site_codebase,
        "history":    "//history" + site_codebase,
        
        "labs":       "//labs",
        "parallax":   "//parallax",
        "tmt":        "//tmt",
        "cubed":      "//cubed"
    };

    // Defaults to trunk lib if not specified.
    if (!lib) { 
        lib = rules["labels"]["lib"];
    }

    // *********** PREFIX *************
    
    
    rules["prefix"] = [ 
        
        {prefix:"/favicon.ico",        app:"lib", script: "template/favicon.ico"},
        {prefix:"/index",              url:"/", redirect: 301},
        {prefix:"/homepage",           app:"homepage", script:"index.controller"},
        {prefix:"/explore",            app:"activity"},
        {prefix:"/schema",             app:"schema"},
        {prefix:"/apps",               app:"apps"},
        {prefix:"/appeditor",          app:"appeditor"},
        {prefix:"/docs",               app:"devdocs"},
        {prefix:"/policies",           app:"policies"},
        {prefix:"/queryeditor",        app:"query", script:"editor.template"},
        {prefix:"/query",              app:"query"},
        {prefix:"/labs/cubed",         app:"cubed"},
        {prefix:"/labs/parallax",      app:"parallax"},
        {prefix:"/labs",               app:"labs"},
        {prefix:"/account",            app:"account"},

        // Urls for administrative tools
        {prefix:"/admin",              app:"admin"},
        {prefix:"/app/tmt",            app:"tmt"},
        
        
        //
        // Redirects for legacy urls
        //
        
        // Domain activity browser
        {prefix:"/view/mydomains",          url:"/explore", redirect:301},
        {prefix:"/site/data",               url:"/explore", redirect:301},
        {prefix:"/view/allDomains",         url:"/explore", redirect:301},
        {prefix:"/data",                    url:"/explore", redirect:301},
        {prefix:"/domain/users",            url:"/explore", redirect:301},
        
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
        {prefix:"/app/queryeditor",         url:"/queryeditor", redirect:301},
        {prefix:"/tools/queryeditor",       url:"/queryeditor", redirect:301},
        {prefix:"/view/queryeditor",        url:"/queryeditor", redirect:301},
        
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
            "app": "lib",                   // app containing the promise method
            "script": "queries/object.sjs", // script containing the promise method
            "promise": "blurb"              // promise method (passed object query result as arugment)
        }
    ];


    rules["object"] =  [
        {
            "type": "/freebase/apps/application",
            "promises": h.extend(true, [], DEFAULT_PROMISES).concat([{
                "key": "breadcrumbs",
                "app": "lib",
                "script": "queries/breadcrumbs.sjs",
                "promise": "app"
            }]),
            "tabs": [
                {
                    "name": "View",
                    "key": "view",
                    "app": "topic",
                    "script": "topic.tab",
                    "params": {
                        "domains": "all",
                        "type": "/freebase/apps/application"
                    }
                },
                {
                    "name": "Activity",
                    "key": "activity",
                    "app": "activity",
                    "script": "app.tab"
                },
                {
                    "name": "Authors",
                    "key": "authors",
                    "app": "group",
                    "script": "group.tab"
                },
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ],
            "navs": [
                {
                    "name": "Edit Settings",
                    "key": "settings",
                    "app": "admin",
                    "ajax": "app_settings.mf.js",
                    "auth": true // add "edit" class
                },
                {
                    "name": "View source",
                    "url": h.fb_url("/appeditor/#app=${id}")
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
                    "name": "Community",
                    "key": "community",
                    "app": "group",
                    "script": "group.tab"
                },
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ],
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
                    "name": "Data",
                    "key": "data",
                    "app": "data",
                    "script": "type.tab"
                },
                {
                    "name": "Schema",
                    "key": "schema",
                    "app": "schema",
                    "script": "type.tab"
                },
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ],
            "navs": [
                {
                    "name": "Edit Settings",
                    "app": "admin",
                    "ajax": "type_settings.mf.js",
                    "auth": true // add "edit" class
                },
                {
                    "name": "Build Query",
                    "url": h.fb_url("/queryeditor", {q:JSON.stringify([{id:null, name:null, type:"${id}"}])})
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
                "app": "lib",
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
                },
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                        "script": "triples.tab"
                }
            ]
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
                    "name": "Domains",
                    "key": "domains",
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
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ],
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
            }]),
            "tabs": [
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ],
            "navs": [
                {
                    "name": "Run Query",
                    "url": h.fb_url("/queryeditor")
                }
            ]
        },
        {
            "type": "/common/topic",
            "promises": [
                {
                    "key": "notable_types",
                    "app": "lib",
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
            "tabs": [
                {
                    "name": "View",
                    "key": "view",
                    "app": "topic",
                    "script": "topic.tab"
                },
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab",
                    "promises": h.extend(true, [], DEFAULT_PROMISES)
                },
                {
                    "name": "On the Web",
                    "key": "web",
                    "app": "sameas",
                    "script": "sameas.tab",
                    "promises": h.extend(true, [], DEFAULT_PROMISES)
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
            "tabs": [
                {
                    "name": "Inspect",
                    "key": "inspect",
                    "app": "triples",
                    "script": "triples.tab"
                }
            ]
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

    rules["routers"] = ["host", "home", "static", "ajax", "prefix", "object"];
        
    return rules;
}