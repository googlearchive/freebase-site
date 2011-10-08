

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//28a.lib.www.tags.svn.freebase-site.googlecode.dev",

  "site": "//11a.site" + tags_codebase,
  "account": "//15a.account" + tags_codebase,
  "activity": "//13a.activity" + tags_codebase,
  "admin": "//12a.admin" + tags_codebase,
  "appeditor": "//16a.appeditor" + tags_codebase,
  "apps": "//16a.apps" + tags_codebase,
  "create": "//12a.create" + tags_codebase,
  "data": "//13a.data" + tags_codebase,
  "devdocs": "//15a.devdocs" + tags_codebase,
  "group": "//14a.group" + tags_codebase,
  "history": "//7a.history" + tags_codebase,
  "homepage": "//18a.homepage" + tags_codebase,
  "policies": "//16a.policies" + tags_codebase,
  "query": "//13a.query" + tags_codebase,
  "sameas": "//14a.sameas" + tags_codebase,
  "sample": "//13a.sample" + tags_codebase,
  "schema": "//19a.schema" + tags_codebase,
  "topic": "//19a.topic" + tags_codebase,
  "triples": "//15a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

var METADATA = {
  "mounts": {
    "lib": environment_rules.labels.lib
  }
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

