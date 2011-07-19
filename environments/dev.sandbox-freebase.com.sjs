// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

// freebase-site trunk lib
var lib = "23b.lib.www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": lib,

  "activity": "//11a.activity" + tags_codebase,
  "admin": "//10a.admin" + tags_codebase,
  "appeditor": "//12a.appeditor" + tags_codebase,
  "apps": "//14a.apps" + tags_codebase,
  "create": "//10a.create" + tags_codebase,
  "data": "//11a.data" + tags_codebase,
  "devdocs": "//13a.devdocs" + tags_codebase,
  "group": "//12a.group" + tags_codebase,
  "history": "//5a.history" + tags_codebase,
  "homepage": "//16a.homepage" + tags_codebase,
  "account": "//13a.account" + tags_codebase,
  "policies": "//14a.policies" + tags_codebase,
  "query": "//11a.query" + tags_codebase,
  "sameas": "//12a.sameas" + tags_codebase,
  "sample": "//11a.sample" + tags_codebase,
  "schema": "//17a.schema" + tags_codebase,
  "topic": "//17a.topic" + tags_codebase,
  "triples": "//13a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

var default_rules = acre.require(lib + "/site/freebase-site/default_routes.sjs").init_default_routes(lib);

acre.require(lib + "/routing/router.sjs").route(default_rules, environment_rules, this);

