
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//78a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//51a.account" + tags_codebase,
        "appeditor": "//52a.appeditor" + tags_codebase,
        "apps": "//53a.apps" + tags_codebase,
        "create": "//48a.create" + tags_codebase,
        "data": "//49a.data" + tags_codebase,
        "discuss": "//7a.discuss" + tags_codebase,
        "mdo": "//30a.mdo" + tags_codebase,
        "policies": "//52a.policies" + tags_codebase,
        "query": "//49a.query" + tags_codebase,
        "review": "//31a.review" + tags_codebase,
        "sameas": "//50a.sameas" + tags_codebase,
        "sample": "//51a.sample" + tags_codebase,
        "schema": "//55a.schema" + tags_codebase,
        "topic": "//55a.topic" + tags_codebase,
        "triples": "//51a.triples" + tags_codebase,
        "users": "//29a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

