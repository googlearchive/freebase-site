/**
 * Routing happens in 2 stages
 *
 * 1. HostRouter - redirect legacy hosts to the canonical domain/host.
 * 2. PrefixRouter - the main prefix-based routing rules
 */

// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";
var lib = "//lib" + codebase;

var apps = {
  "topic":      "//topic" + codebase,
  "schema":     "//schema" + codebase,
  "activity":   "//activity" + codebase,
  "triples":    "//triples" + codebase,
  "group":      "//group" + codebase,
  "sameas":     "//sameas" + codebase,
  "homepage":   "//homepage" + codebase,
  "data":       "//data" + codebase,
  "apps":       "//apps" + codebase,
  "appeditor":  "//appeditor" + codebase,
  "docs":       "//devdocs" + codebase,
  "policies":   "//policies" + codebase,
  "query":      "//query" + codebase,
  "sample":     "//sample" + codebase,
  "account":    "//account" + codebase,
  "admin":      "//admin" + codebase,
  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

var rules = {
  "host": [
    {host:"freebase.com", url:"http://www.freebase.com"},
    {host:"sandbox-freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"sandbox.freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
    {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
    {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"metaweb.com", url:"http://www.freebase.com"},
    {host:"www.metaweb.com", url:"http://www.freebase.com"}
  ],
  
  "object": [
    {type: "/freebase/apps/application", tabs: [
      ["View", apps.topic + "/topic.controller", {domains: "all", type: "/freebase/apps/application"}],
      ["Authors", apps.group + "/group.controller"],
      ["Activity", apps.activity + "/app.controller"],
      ["Inspect", apps.triples + "/triples.controller"]
    ]},
    {type: "/type/domain", tabs: [
      ["Data", apps.data + "/domain.controller"],
      ["Schema", apps.schema + "/domain.controller"],
      ["Community", apps.group + "/group.controller"]
      ["Inspect", apps.triples + "/triples.controller"],
    ]},
    {type: "/type/type", tabs: [
      ["Data", apps.data + "/type.controller"],
      ["Schema", apps.schema + "/type.controller"],
      ["Inspect", apps.triples + "/triples.controller"]
    ]},
    {type: "/type/property", tabs: [
      ["Schema", apps.schema + "/property.controller"],
      ["Inspect", apps.triples + "/triples.controller"]
    ]},
    {type: "/type/user", tabs: [
      ["Domains", apps.data + "/user.controller"],
      ["Queries", apps.query + "/user.controller"],
      ["Apps", apps.apps + "/user.controller"],
      ["Inspect", apps.triples + "/triples.controller"]
    ]},
    {type: "/freebase/query", tabs: [
      ["Data", apps.data + "/query.controller"],
      ["Inspect", apps.triples + "/triples.controller"]
    ]},
    {type: "/common/topic", tabs: [
      ["View", apps.topic + "/topic.controller"],
      ["Inspect", apps.triples + "/triples.controller"],
      ["On the Web", apps.sameas + "/sameas.controller"]
    ]},
    {type: "/type/object", tabs: [
      ["Inspect", apps.triples]
    ]}
  ],

  "prefix": [
    // Urls for user-facing apps
    {prefix:"/favicon.ico",        app:lib, script: "template/favicon.ico"},
    {prefix:"/",                   app:apps.homepage, script: "index"},
    {prefix:"/index",              url:"/", redirect: 301},
    {prefix:"/home",               app:apps.homepage, script: "home"},
    {prefix:"/homepage",           app:apps.homepage},
    {prefix:"/schema",             app:apps.schema},
    {prefix:"/apps",               app:apps.apps},
    {prefix:"/appeditor",          app:apps.appeditor},
    {prefix:"/docs",               app:apps.devdocs},
    {prefix:"/policies",           app:apps.policies},
    {prefix:"/query",              app:apps.query},
    {prefix:"/labs/cubed",         app:apps.cubed},
    {prefix:"/labs/parallax",      app:apps.parallax},
    {prefix:"/labs",               app:apps.labs},
    {prefix:"/sample",             app:apps.sample},
    {prefix:"/account",            app:apps.account},

    // Urls for exposed ajax libraries and static resources
    // TODO: remove this and use ajax router
    {prefix:"/static",             app:lib, script:"routing/static.sjs"},
    {prefix:"/ajax",               app:lib, script:"routing/ajax.sjs"},

    // Test routing rules to test non-user facing apps (core libraries, etc.)
    {prefix:"/lib/appeditor-services",  app:lib + "/appeditor-services"},
    {prefix:"/lib/filter",         app:lib + "/filter"},
    {prefix:"/lib/handlers",       app:lib + "/handlers"},
    {prefix:"/lib/helper",         app:lib + "/helper"},
    {prefix:"/lib/i18n",           app:lib + "/i18n"},
    {prefix:"/lib/permission",     app:lib + "/permission"},
    {prefix:"/lib/promise",        app:lib + "/promise"},
    {prefix:"/lib/propbox",        app:lib + "/propbox"},
    {prefix:"/lib/queries",        app:lib + "/queries"},
    {prefix:"/lib/routing",        app:lib + "/routing"},
    {prefix:"/lib/template",       app:lib + "/template"},
    {prefix:"/lib/test",           app:lib + "/test"},
    {prefix:"/lib/validator",      app:lib + "/validator"},

    // Urls for administrative tools
    {prefix:"/admin",              app:apps.admin},
    {prefix:"/app/tmt",            app:apps.tmt},

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
    {prefix:"/community",               url:"http://wiki.freebase.com", redirect:301},
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
    {prefix:"/view/schema",             url:"/", redirect:301},
    {prefix:"/tools/schema",            url:"/", redirect:301},
    {prefix:"/type/schema",             url:"/", redirect: 301},

    // Queryeditor
    {prefix:"/queryeditor",             url:"/query/editor", redirect:301},
    {prefix:"/app/queryeditor",         url:"/query/editor", redirect:301},
    {prefix:"/tools/queryeditor",       url:"/query/editor", redirect:301},
    {prefix:"/view/queryeditor",        url:"/query/editor", redirect:301},

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
    {prefix:"/view/filter",             url:"/", redirect:301},
    {prefix:"/view/domain",             url:"/", redirect:301},
    {prefix:"/view/image",              url:"/", redirect:301},
    {prefix:"/view/document",           url:"/", redirect:301},
    {prefix:"/view/usergroup",          url:"/", redirect:301},
    {prefix:"/view/fb",                 url:"/", redirect:301},
    {prefix:"/view/query",              url:"/", redirect:301},
    {prefix:"/view/api/metaweb/view",   url:"/", redirect:301},
    {prefix:"/view/guid/filter",        url:"/", redirect:301},
    {prefix:"/view/help",               url:"/", redirect:301},
    {prefix:"/view",                    url:"/", redirect:301},
    {prefix:"/helptopic",               url:"/", redirect:301},
    {prefix:"/iv/fb",                   url:"/", redirect:301},

    // Other
    {prefix:"/view/userdomains",        url:"/domain/users", redirect:301},
    {prefix:"/newsfeed",                url:"/private/newsfeed", redirect:301}
  ]
};

acre.require(lib + "/routing/router.sjs").route(rules, this);
