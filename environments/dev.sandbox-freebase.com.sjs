
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    "labels" : {
        "lib": "//53a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//24a.site" + tags_codebase,
        "account": "//27a.account" + tags_codebase,
        "appeditor": "//28a.appeditor" + tags_codebase,
        "apps": "//28a.apps" + tags_codebase,
        "create": "//24a.create" + tags_codebase,
        "data": "//25a.data" + tags_codebase,
        "flyout": "//3a.flyout" + tags_codebase,
        "mdo": "//6a.mdo" + tags_codebase,
        "policies": "//28a.policies" + tags_codebase,
        "query": "//25a.query" + tags_codebase,
        "review": "//6a.review" + tags_codebase,
        "sameas": "//26a.sameas" + tags_codebase,
        "sample": "//27a.sample" + tags_codebase,
        "schema": "//31a.schema" + tags_codebase,
        "topic": "//31a.topic" + tags_codebase,
        "triples": "//27a.triples" + tags_codebase,
        "users": "//6a.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]
 
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

