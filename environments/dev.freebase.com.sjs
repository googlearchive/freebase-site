
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//75a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//45a.site" + tags_codebase,
        "account": "//48a.account" + tags_codebase,
        "appeditor": "//49a.appeditor" + tags_codebase,
        "apps": "//49a.apps" + tags_codebase,
        "create": "//45a.create" + tags_codebase,
        "data": "//46a.data" + tags_codebase,
        "discuss": "//4a.discuss" + tags_codebase,
        "mdo": "//27a.mdo" + tags_codebase,
        "policies": "//49a.policies" + tags_codebase,
        "query": "//46a.query" + tags_codebase,
        "review": "//28a.review" + tags_codebase,
        "sameas": "//47a.sameas" + tags_codebase,
        "sample": "//48a.sample" + tags_codebase,
        "schema": "//52a.schema" + tags_codebase,
        "topic": "//52a.topic" + tags_codebase,
        "triples": "//48a.triples" + tags_codebase,
        "users": "//26a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

