
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//76b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//46b.site" + tags_codebase,
        "account": "//49b.account" + tags_codebase,
        "appeditor": "//50b.appeditor" + tags_codebase,
        "apps": "//50b.apps" + tags_codebase,
        "create": "//46b.create" + tags_codebase,
        "data": "//47b.data" + tags_codebase,
        "discuss": "//5b.discuss" + tags_codebase,
        "mdo": "//28b.mdo" + tags_codebase,
        "policies": "//50b.policies" + tags_codebase,
        "query": "//47a.query" + tags_codebase,
        "review": "//29a.review" + tags_codebase,
        "sameas": "//48a.sameas" + tags_codebase,
        "sample": "//49a.sample" + tags_codebase,
        "schema": "//53a.schema" + tags_codebase,
        "topic": "//53a.topic" + tags_codebase,
        "triples": "//49a.triples" + tags_codebase,
        "users": "//27a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

