
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//55a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//26b.site" + tags_codebase,
        "account": "//29b.account" + tags_codebase,
        "appeditor": "//30b.appeditor" + tags_codebase,
        "apps": "//30b.apps" + tags_codebase,
        "create": "//26b.create" + tags_codebase,
        "data": "//27b.data" + tags_codebase,
        "mdo": "//8a.mdo" + tags_codebase,
        "policies": "//30a.policies" + tags_codebase,
        "query": "//27a.query" + tags_codebase,
        "review": "//8a.review" + tags_codebase,
        "sameas": "//28a.sameas" + tags_codebase,
        "sample": "//29a.sample" + tags_codebase,
        "schema": "//33a.schema" + tags_codebase,
        "topic": "//33a.topic" + tags_codebase,
        "triples": "//29a.triples" + tags_codebase,
        "users": "//8a.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

