
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    "labels" : {
        "lib": "//52b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//23a.site" + tags_codebase,
        "account": "//26a.account" + tags_codebase,
        "appeditor": "//27a.appeditor" + tags_codebase,
        "apps": "//27a.apps" + tags_codebase,
        "create": "//23a.create" + tags_codebase,
        "data": "//24a.data" + tags_codebase,
        "flyout": "//2a.flyout" + tags_codebase,
        "mdo": "//5a.mdo" + tags_codebase,
        "policies": "//27a.policies" + tags_codebase,
        "query": "//24a.query" + tags_codebase,
        "review": "//5a.review" + tags_codebase,
        "sameas": "//25a.sameas" + tags_codebase,
        "sample": "//26a.sample" + tags_codebase,
        "schema": "//30a.schema" + tags_codebase,
        "topic": "//30a.topic" + tags_codebase,
        "triples": "//26a.triples" + tags_codebase,
        "users": "//5a.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]
 
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

