
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//57c.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//27b.site" + tags_codebase,
        "account": "//30b.account" + tags_codebase,
        "appeditor": "//31b.appeditor" + tags_codebase,
        "apps": "//31a.apps" + tags_codebase,
        "create": "//27a.create" + tags_codebase,
        "data": "//28a.data" + tags_codebase,
        "mdo": "//9a.mdo" + tags_codebase,
        "policies": "//31a.policies" + tags_codebase,
        "query": "//28a.query" + tags_codebase,
        "review": "//9a.review" + tags_codebase,
        "sameas": "//29a.sameas" + tags_codebase,
        "sample": "//30a.sample" + tags_codebase,
        "schema": "//34a.schema" + tags_codebase,
        "topic": "//34a.topic" + tags_codebase,
        "triples": "//30a.triples" + tags_codebase,
        "users": "//8c.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

