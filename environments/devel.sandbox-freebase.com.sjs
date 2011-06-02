// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "account":    "//account" + codebase,
  "activity":   "//activity" + codebase,
  "admin":      "//admin" + codebase,
  "appeditor":  "//appeditor" + codebase,
  "apps":       "//apps" + codebase,
  "create":     "//create" + codebase,
  "cubed":      "//cubed",
  "data":       "//data" + codebase,
  "docs":       "//devdocs" + codebase,
  "group":      "//group" + codebase,
  "homepage":   "//homepage" + codebase,
  "labs":       "//labs",
  "lib":        "//lib" + codebase,
  "parallax":   "//parallax",
  "policies":   "//policies" + codebase,
  "query":      "//query" + codebase,
  "sameas":     "//sameas" + codebase,
  "sample":     "//sample" + codebase,
  "schema":     "//schema" + codebase,
  "tmt":        "//tmt",
  "topic":      "//topic" + codebase,
  "triples":    "//triples" + codebase
};


// environment-specific overrides to the default routing rules in lib/routing
var rules = {

  prefix: [
    // Test routing rules to test non-user facing apps (core libraries, etc.)
    {prefix:"/test_lib_appeditor-services",  app:"lib", script:"appeditor-services/test"},
    {prefix:"/test_lib_filter",         app:"lib", script:"filter/test"},
    {prefix:"/test_lib_handlers",       app:"lib", script:"handlers/test"},
    {prefix:"/test_lib_helper",         app:"lib", script:"helper/test"},
    {prefix:"/test_lib_i18n",           app:"lib", script:"i18n/test"},
    {prefix:"/test_lib_permission",     app:"lib", script:"permission/test"},
    {prefix:"/test_lib_promise",        app:"lib", script:"promise/test"},
    {prefix:"/test_lib_propbox",        app:"lib", script:"propbox/test"},
    {prefix:"/test_lib_queries",        app:"lib", script:"queries/test"},
    {prefix:"/test_lib_routing",        app:"lib", script:"routing/test"},
    {prefix:"/test_lib_template",       app:"lib", script:"template/test"},
    {prefix:"/test_lib_test",           app:"lib", script:"test/test"},
    {prefix:"/test_lib_validator",      app:"lib", script:"validator/test"},

    {prefix:"/test_inspect",            app:"triples", script:"test"},
    {prefix:"/test_schema",             app:"schema", script:"test"},
    {prefix:"/test_topic",              app:"topic", script:"test"},
    {prefix:"/test_data",               app:"data", script:"test"},


    // sample app
    {prefix:"/sample",             app:"sample"}
  ]

};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
