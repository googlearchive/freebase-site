/**
  Routes for mapping between url space to apps/scripts
  1. There must be a 1-1 mapping between a url prefix and (app,script) combo
  2. Please place your app in the correct section depending on type of url
  3. If you are ever taking away a url for a user-facing app then you
     must provide a legacy redirect to an appropriate page.
 */

var router = acre.require("router");
var rules = new router.PrefixRouter();

// Urls for user-facing apps
rules.add([
  {prefix:"/",                   app:"homepage", script: "index"},
  {prefix:"/index",              url:"/", redirect:301},
  {prefix:"/home",               app:"homepage", script: "home"},
  {prefix:"/homepage",           app:"homepage"},
  {prefix:"/schema",             app:"schema"},
  {prefix:"/apps",               app:"apps"},
  {prefix:"/docs",               app:"devdocs"},
  {prefix:"/policies",           app:"policies"},
  {prefix:"/appeditor",          app:"appeditor"},
  {prefix:"/about",              app:"about"},
  {prefix:"/labs/cubed",         app:"cubed"},
  {prefix:"/labs/parallax",      app:"parallax"},
  {prefix:"/labs",               app:"labs"},
  {prefix:"/queryeditor",        app:"queryeditor"},
  {prefix:"/inspect",            app:"triples"}
]);

// Urls for exposed ajax libraries
rules.add([
  {prefix:"/permission",         app:"permission"},
  {prefix:"/toolbox",            app:"toolbox"},
  {prefix:"/cuecard",            app:"cuecard" },
  {prefix:"/appeditor/services", app:"appeditor-services" }
]);

// Urls for administrative tools
rules.add([
  {prefix:"/app/admin",          app:"appadmin"},
  {prefix:"/app/tmt",            app:"tmt"}
]);

// Urls for development purposes only
rules.add([
  {prefix:"/sample",             app:"sample"},
  {prefix:"/sample2",            app:"sample2"},
  {prefix:"/core",               app:"core"},
  {prefix:"/jqueryui",           app:"jqueryui"},
  {prefix:"/i18n",               app:"i18n"},
  {prefix:"/template",           app:"template"},
  {prefix:"/promise",            app:"promise"},
  {prefix:"/routing",            app:"routing" },
  {prefix:"/queries",            app:"queries"},
  {prefix:"/codemirror",         app:"codemirror" },
  {prefix:"/validator",          app:"validator"},
  {prefix:"/test",               app:"test"}
]);

// Redirects for legacy urls
rules.add([
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
]);
                 
// Host redirects
var host_redirects = {
  "freebase.com": "http://www.freebase.com",
  "sandbox-freebase.com": "http://www.sandbox-freebase.com",
  "acre.freebase.com": "http://www.freebase.com/appeditor",
  "acre.sandbox-freebase.com": "http://www.sandbox-freebase.com/appeditor",
  "api.freebase.com": "http://wiki.freebase.com/wiki/Freebase_API",
  "api.sandbox-freebase.com": "http://wiki.freebase.com/wiki/Freebase_API"
};
