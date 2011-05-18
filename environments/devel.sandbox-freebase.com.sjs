// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//lib" + codebase,
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

  prefix: [
    // Test routing rules to test non-user facing apps (core libraries, etc.)
    {prefix:"/lib/appeditor-services",  app:"lib", script:"appeditor-services"},
    {prefix:"/lib/filter",         app:"lib", script:"filter"},
    {prefix:"/lib/handlers",       app:"lib", script:"handlers"},
    {prefix:"/lib/helper",         app:"lib", script:"helper"},
    {prefix:"/lib/i18n",           app:"lib", script:"i18n"},
    {prefix:"/lib/permission",     app:"lib", script:"permission"},
    {prefix:"/lib/promise",        app:"lib", script:"promise"},
    {prefix:"/lib/propbox",        app:"lib", script:"propbox"},
    {prefix:"/lib/queries",        app:"lib", script:"queries"},
    {prefix:"/lib/routing",        app:"lib", script:"routing"},
    {prefix:"/lib/template",       app:"lib", script:"template"},
    {prefix:"/lib/test",           app:"lib", script:"test"},
    {prefix:"/lib/validator",      app:"lib", script:"validator"}
  ]

};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
