
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//77a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//50a.account" + tags_codebase,
        "appeditor": "//51a.appeditor" + tags_codebase,
        "apps": "//52a.apps" + tags_codebase,
        "create": "//47a.create" + tags_codebase,
        "data": "//48a.data" + tags_codebase,
        "discuss": "//6a.discuss" + tags_codebase,
        "mdo": "//29a.mdo" + tags_codebase,
        "policies": "//51a.policies" + tags_codebase,
        "query": "//48a.query" + tags_codebase,
        "review": "//30a.review" + tags_codebase,
        "sameas": "//49a.sameas" + tags_codebase,
        "sample": "//50a.sample" + tags_codebase,
        "schema": "//54a.schema" + tags_codebase,
        "topic": "//54a.topic" + tags_codebase,
        "triples": "//50a.triples" + tags_codebase,
        "users": "//28a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

