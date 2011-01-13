/**
 * Routing happens in 3 stages
 *
 * 1. HostRouter - redirect legacy hosts to the canonical domain/host.
 * 2. GlobalRouter -  route a request of the kind /[global]/file_path (e.g., /fss/file_path and /static/file_path).
 * 3. PrefixRouter - the main prefix-based routing rules
 */

// This is the error handler that handles all routing and not found errors
acre.response.set_error_handler("//error.www.trunk.svn.freebase-site.googlecode.dev/index.sjs");

// lib to get routing helpers
var lib = "//lib.www.trunk.svn.freebase-site.googlecode.dev";
var routing = acre.require(lib + "/routing/router");

var rules = {
  "HostRouter": [
    {host:"freebase.com", url:"http://www.freebase.com"},
    {host:"sandbox-freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"sandbox.freebase.com", url:"http://www.sandbox-freebase.com"},
    {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
    {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
    {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
    {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"}
  ],

  "GlobalRouter": null,

  "PrefixRouter": [
    // Urls for user-facing apps
    {prefix:"/",                   app:"//homepage.www.trunk.svn.freebase-site.googlecode.dev", script: "index"},
    {prefix:"/index",              url:"/", redirect:301},
    {prefix:"/home",               app:"//homepage.www.trunk.svn.freebase-site.googlecode.dev", script: "home"},
    {prefix:"/homepage",           app:"//homepage.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/schema",             app:"//schema.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/apps",               app:"//apps.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/appeditor",          app:"//appeditor.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/docs",               app:"//devdocs.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/inspect",            app:"//triples.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/policies",           app:"//policies.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/queryeditor",        app:"//queryeditor.www.trunk.svn.freebase-site.googlecode.dev"},
    {prefix:"/labs/cubed",         app:"//cubed"},
    {prefix:"/labs/parallax",      app:"//parallax"},
    {prefix:"/labs",               app:"//labs"},

    // Urls for exposed ajax libraries and static resources
    {prefix:"/permission",         app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/permission"},
    {prefix:"/template",           app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/template"},

    // Test routing rules to test non-user facing apps (core libraries, etc.)
    {prefix:"/lib/core",           app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/core"},
    {prefix:"/lib/routing",        app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/routing"},
    {prefix:"/lib/i18n",           app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/i18n"},
    {prefix:"/lib/promise",        app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/promise"},
    {prefix:"/lib/queries",        app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/queries"},
    {prefix:"/lib/test",           app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/test"},
    {prefix:"/lib/validator",      app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/validator"},

    // Urls for administrative tools
    {prefix:"/app/admin",          app:"admin"},
    {prefix:"/app/tmt",            app:"tmt"},

    //
    // Redirects for legacy urls
    //
    // Signin
    {prefix:"/signin/recoverPassword",   url:"/signin/recoverpassword", redirect:301},
    {prefix:"/signin/recoverPassword3",  url:"/signin/changepassword", redirect:301},
    {prefix:"/private/account/activate", url:"/signin/activate", redirect:301},
    {prefix:"/signin/app",               url:"/signin/authorize_token", redirect:301},

    // Account settings
    {prefix:"/view/account",       url:"/user/settings/account", redirect:301},
    {prefix:"/user/account",       url:"/user/settings/account", redirect:301},

    // Wiki
    {prefix:"/help",               url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/help/faq",           url:"http://wiki.freebase.com/wiki/FAQ", redirect:301},
    {prefix:"/developer",          url:"http://wiki.freebase.com/wiki/Developers", redirect:301},
    {prefix:"/view/developer",     url:"http://wiki.freebase.com/wiki/Developers", redirect:301},
    {prefix:"/view/faq",           url:"http://wiki.freebase.com/wiki/FAQ", redirect:301},
    {prefix:"/view/documentation", url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/view/helpsearch",    url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/view/helpcenter",    url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/view/tutorial",      url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/view/discussionhub", url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/discuss/hub",        url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/tools",              url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/community",          url:"http://wiki.freebase.com", redirect:301},
    {prefix:"/build",              url:"http://wiki.freebase.com", redirect:301},

    // Feedback
    {prefix:"/view/feedback",        url:"/site/feedback", redirect:301},
    {prefix:"/view/feedback_thanks", url:"/site/feedback_thanks", redirect:301},

    // Discuss
    {prefix:"/view/discuss",       url:"/discuss/threads", redirect:301},
    {prefix:"/view/mydiscuss",     url:"/user/replies", redirect:301},
    {prefix:"/user/discuss",       url:"/user/replies", redirect:301},

    // Homepage
    {prefix:"/view/mydomains",     url:"/home", redirect:301},
    {prefix:"/user/domains",       url:"/home", redirect:301},
    {prefix:"/signin",             url:"/", redirect:301},
    {prefix:"/signin/signin",      url:"/", redirect:301},
    {prefix:"/signin/signin.html", url:"/", redirect:301},
    {prefix:"/site/data",          url:"/", redirect:301},
    {prefix:"/view/allDomains",    url:"/", redirect:301},
    {prefix:"/data",               url:"/", redirect:301},
    {prefix:"/explore",            url:"/", redirect:301},

    // User profile
    {prefix:"/view/user",          url:"/user/profile", redirect:301},

    // History
    {prefix:"/view/history",       url:"/history/view", redirect:301},
    {prefix:"/history/user",       url:"/history/view", redirect:301},
    {prefix:"/history/topic",      url:"/history/view", redirect:301},

    // Schema
    {prefix:"/view/schema",        url:"/schema", redirect:301},
    {prefix:"/tools/schema",       url:"/schema", redirect:301},
    {prefix:"/type/schema",        url:"/schema", redirect: 301},

    // Queryeditor
    {prefix:"/app/queryeditor",    url:"/queryeditor", redirect:301},
    {prefix:"/tools/queryeditor",  url:"/queryeditor", redirect:301},
    {prefix:"/view/queryeditor",   url:"/queryeditor", redirect:301},

    // Inspect
    {prefix:"/tools/explore",      url:"/inspect", redirect:301},
    {prefix:"/tools/explore2",     url:"/inspect", redirect:301},

    // Appeditor
    {prefix:"/tools/appeditor",    url:"/appeditor", redirect:301},

    // Review queue
    {prefix:"/tools/pipeline/home",     url:"/tools/flags/review", redirect:301},
    {prefix:"/tools/pipeline/showtask", url:"/tools/flags/review", redirect:301},

    // List Importer
    {prefix:"/import/list",        url:"/importer/list", redirect:301},

    // Search
    {prefix:"/view/search",        url:"/search", redirect:301},

    // Policies
    {prefix:"/signin/tos",         url:"/policies/tos", redirect:301},
    {prefix:"/signin/cc",          url:"/policies/copyright", redirect:301},
    {prefix:"/signin/freebaseid",  url:"/policies/freebaseid", redirect:301},
    {prefix:"/signin/licensing",   url:"/policies/licensing", redirect:301},
    {prefix:"/signin/privacy",     url:"/policies/privacy", redirect:301},

    // View
    {prefix:"/view/filter",           url:"/view", redirect:301},
    {prefix:"/view/domain",           url:"/view", redirect:301},
    {prefix:"/view/image",            url:"/view", redirect:301},
    {prefix:"/view/document",         url:"/view", redirect:301},
    {prefix:"/view/usergroup",        url:"/view", redirect:301},
    {prefix:"/view/fb",               url:"/view", redirect:301},
    {prefix:"/view/query",            url:"/view", redirect:301},
    {prefix:"/view/api/metaweb/view", url:"/view", redirect:301},
    {prefix:"/view/guid/filter",      url:"/view", redirect:301},
    {prefix:"/helptopic",             url:"/view", redirect:301},
    {prefix:"/view/help",             url:"/view", redirect:301},
    {prefix:"/iv/fb",                 url:"/edit/topic", redirect:301},

    // Other
    {prefix:"/view/userdomains",      url:"/domain/users", redirect:301},
    {prefix:"/newsfeed",              url:"/private/newsfeed", redirect:301}
  ]
};

// Dump all routing info and rules.
// This is primarily for our automated buildbot/testrunners
if (acre.current_script === acre.request.script) {
  var d = acre.request.server_name.length - acre.host.name.length;
  if (d >=0 && acre.request.server_name.lastIndexOf(acre.host.name) === d) {
    acre.write(JSON.stringify(rules, null, 2));
    acre.exit();
  }
}

["HostRouter", "GlobalRouter", "PrefixRouter"].forEach(function(name) {
  var RouterClass = routing[name];
  if (!RouterClass) {
    throw name + " not found in " + lib + "/routing/router";
  }
  var router = new RouterClass();
  var rule = rules[name];
  if (rule) {
    router.add(rule);
  }
  router.route(acre.request);
});

// TODO: not found
acre.route("//error.www.trunk.svn.freebase-site.googlecode.dev/index.sjs");


