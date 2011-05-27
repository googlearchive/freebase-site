// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//12a.lib" + tags_codebase,
  "topic":      "//7a.topic" + tags_codebase,
  "schema":     "//7a.schema" + tags_codebase,
  "activity":   "//1a.activity" + tags_codebase,
  "triples":    "//3a.triples" + tags_codebase,
  "group":      "//2a.group" + tags_codebase,
  "sameas":     "//2a.sameas" + tags_codebase,
  "homepage":   "//6a.homepage" + tags_codebase,
  "data":       "//1a.data" + tags_codebase,
  "apps":       "//4a.apps" + tags_codebase,
  "appeditor":  "//2a.appeditor" + tags_codebase,
  "docs":       "//3a.devdocs" + tags_codebase,
  "policies":   "//4a.policies" + tags_codebase,
  "query":      "//1a.query" + tags_codebase,
  "sample":     "//sample" + tags_codebase,
  "account":    "//1a.account" + tags_codebase,
  "admin":      "//admin" + tags_codebase,
  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

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
