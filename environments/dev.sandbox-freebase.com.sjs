

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//27m.lib.www.tags.svn.freebase-site.googlecode.dev",

  "site": "//10g.site" + tags_codebase,
  "account": "//14b.account" + tags_codebase,
  "activity": "//12a.activity" + tags_codebase,
  "admin": "//11a.admin" + tags_codebase,
  "appeditor": "//15a.appeditor" + tags_codebase,
  "apps": "//15a.apps" + tags_codebase,
  "create": "//11a.create" + tags_codebase,
  "data": "//12a.data" + tags_codebase,
  "devdocs": "//14a.devdocs" + tags_codebase,
  "group": "//13a.group" + tags_codebase,
  "history": "//6a.history" + tags_codebase,
  "homepage": "//17a.homepage" + tags_codebase,
  "policies": "//15a.policies" + tags_codebase,
  "query": "//12a.query" + tags_codebase,
  "sameas": "//13a.sameas" + tags_codebase,
  "sample": "//12a.sample" + tags_codebase,
  "schema": "//18a.schema" + tags_codebase,
  "topic": "//18a.topic" + tags_codebase,
  "triples": "//14a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

