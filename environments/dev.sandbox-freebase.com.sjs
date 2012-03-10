
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    "labels" : {
        "lib": "//54a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//25a.site" + tags_codebase,
        "account": "//28a.account" + tags_codebase,
        "appeditor": "//29a.appeditor" + tags_codebase,
        "apps": "//29a.apps" + tags_codebase,
        "create": "//25a.create" + tags_codebase,
        "data": "//26a.data" + tags_codebase,
        "flyout": "//4a.flyout" + tags_codebase,
        "mdo": "//7a.mdo" + tags_codebase,
        "policies": "//29a.policies" + tags_codebase,
        "query": "//26a.query" + tags_codebase,
        "review": "//7a.review" + tags_codebase,
        "sameas": "//27a.sameas" + tags_codebase,
        "sample": "//28a.sample" + tags_codebase,
        "schema": "//32a.schema" + tags_codebase,
        "topic": "//32a.topic" + tags_codebase,
        "triples": "//28a.triples" + tags_codebase,
        "users": "//7a.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]
 
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

