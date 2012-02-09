
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.
    
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    "labels" : {
        "lib": "//51c.lib.www.tags.svn.freebase-site.googlecode.dev",

        "site": "//22b.site" + tags_codebase,
        "account": "//25a.account" + tags_codebase,
        "appeditor": "//26a.appeditor" + tags_codebase,
        "apps": "//26a.apps" + tags_codebase,
        "create": "//22a.create" + tags_codebase,
        "data": "//23a.data" + tags_codebase,
        "flyout": "//1a.flyout" + tags_codebase,
        "mdo": "//4a.mdo" + tags_codebase,
        "policies": "//26a.policies" + tags_codebase,
        "query": "//23a.query" + tags_codebase,
        "review": "//4a.review" + tags_codebase,
        "sameas": "//24a.sameas" + tags_codebase,
        "sample": "//25a.sample" + tags_codebase,
        "schema": "//29a.schema" + tags_codebase,
        "topic": "//29a.topic" + tags_codebase,
        "triples": "//25a.triples" + tags_codebase,
        "users": "//4a.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]
 
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

