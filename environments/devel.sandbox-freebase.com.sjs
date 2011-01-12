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

//
// 1. HostRouter
//
var router = new routing.HostRouter();
router.add([
  {host:"freebase.com", url:"http://www.freebase.com"},
  {host:"sandbox-freebase.com", url:"http://www.sandbox-freebase.com"},
  {host:"sandbox.freebase.com", url:"http://www.sandbox-freebase.com"},
  {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
  {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
  {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
  {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"}
]);
router.route(acre.request);

//
// 2. GlobalRouter
//
router = new routing.GlobalRouter();
router.route(acre.request);

//
// 3. PrefixRouter
//
router = new routing.PrefixRouter();

// Urls for user-facing apps
router.add([
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
  {prefix:"/labs",               app:"//labs"}
]);

// add test routing rules to test non-user facing apps (core libraries, etc.)
router.add([
  {prefix:"/test/core", app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/core"},
  {prefix:"/test/routing", app:"//lib.www.trunk.svn.freebase-site.googlecode.dev/routing"}
]);

router.route(acre.request);

// TODO: not found
acre.route("//error.www.trunk.svn.freebase-site.googlecode.dev/index.sjs");
