
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//74a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//44a.site" + tags_codebase,
        "account": "//47a.account" + tags_codebase,
        "appeditor": "//48a.appeditor" + tags_codebase,
        "apps": "//48a.apps" + tags_codebase,
        "create": "//44a.create" + tags_codebase,
        "data": "//45a.data" + tags_codebase,
        "discuss": "//3a.discuss" + tags_codebase,
        "mdo": "//26a.mdo" + tags_codebase,
        "policies": "//48a.policies" + tags_codebase,
        "query": "//45a.query" + tags_codebase,
        "review": "//27a.review" + tags_codebase,
        "sameas": "//46a.sameas" + tags_codebase,
        "sample": "//47a.sample" + tags_codebase,
        "schema": "//51a.schema" + tags_codebase,
        "topic": "//51a.topic" + tags_codebase,
        "triples": "//47a.triples" + tags_codebase,
        "users": "//25a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

