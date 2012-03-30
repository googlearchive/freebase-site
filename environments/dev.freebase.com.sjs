
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//55c.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//26d.site" + tags_codebase,
        "account": "//29c.account" + tags_codebase,
        "appeditor": "//appeditor" + codebase,
        "apps": "//apps" + codebase,
        "create": "//26c.create" + tags_codebase,
        "data": "//27c.data" + tags_codebase,
        "mdo": "//8b.mdo" + tags_codebase,
        "policies": "//30b.policies" + tags_codebase,
        "query": "//27b.query" + tags_codebase,
        "review": "//8b.review" + tags_codebase,
        "sameas": "//28b.sameas" + tags_codebase,
        "sample": "//29b.sample" + tags_codebase,
        "schema": "//33b.schema" + tags_codebase,
        "topic": "//33b.topic" + tags_codebase,
        "triples": "//29b.triples" + tags_codebase,
        "users": "//8b.users" + tags_codebase

    },

    "prefix" : [
      { prefix:"/keystore", app:"default",  script: "keystore.sjs"},

    ]

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

