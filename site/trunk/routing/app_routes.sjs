/**
  Routes for mapping between url space to apps/scripts
  1. There must be a 1-1 mapping between a url prefix and (app,script) combo
  2. Please place your app in the correct section depending on type of url
  3. If you are ever taking away a url for a user-facing app then you
     must provide a legacy redirect to an appropriate page.
 */
console.log("acre", acre);
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
  {prefix:"/core",               app:"core"},
  {prefix:"/jqueryui",           app:"jqueryui"},
  {prefix:"/i18n",               app:"i18n"},
  {prefix:"/template",           app:"template"},
  {prefix:"/routing",            app:"routing" },
  {prefix:"/queries",            app:"queries"},
  {prefix:"/codemirror",         app:"codemirror" },
  {prefix:"/validator",          app:"validator"}
]);

// Redirects for legacy urls
rules.add([
  {prefix:"/developer",          url:"http://wiki.freebase.com/wiki/Developers", redirect:301},
  {prefix:"/app/queryeditor",    url:"/queryeditor", redirect:301},
  {prefix:"/tools/queryeditor",  url:"/queryeditor", redirect:301},
  {prefix:"/tools/appeditor",    url:"/appeditor", redirect:301},
  {prefix:"/tools/explore",      url:"/inspect", redirect:301},
  {prefix:"/tools/explore2",     url:"/inspect", redirect:301}
]);
