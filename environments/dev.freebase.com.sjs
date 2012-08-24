
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//79e.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//52a.account" + tags_codebase,
        "appeditor": "//53a.appeditor" + tags_codebase,
        "apps": "//54a.apps" + tags_codebase,
        "create": "//49a.create" + tags_codebase,
        "data": "//50a.data" + tags_codebase,
        "discuss": "//8a.discuss" + tags_codebase,
        "mdo": "//31a.mdo" + tags_codebase,
        "policies": "//53a.policies" + tags_codebase,
        "query": "//50a.query" + tags_codebase,
        "review": "//32a.review" + tags_codebase,
        "sameas": "//51a.sameas" + tags_codebase,
        "sample": "//52a.sample" + tags_codebase,
        "schema": "//56a.schema" + tags_codebase,
        "topic": "//56a.topic" + tags_codebase,
        "triples": "//52a.triples" + tags_codebase,
        "users": "//30a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

