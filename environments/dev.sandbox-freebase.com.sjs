
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//78b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//51b.account" + tags_codebase,
        "appeditor": "//52b.appeditor" + tags_codebase,
        "apps": "//53b.apps" + tags_codebase,
        "create": "//48b.create" + tags_codebase,
        "data": "//49b.data" + tags_codebase,
        "discuss": "//7b.discuss" + tags_codebase,
        "mdo": "//30b.mdo" + tags_codebase,
        "policies": "//52b.policies" + tags_codebase,
        "query": "//49b.query" + tags_codebase,
        "review": "//31b.review" + tags_codebase,
        "sameas": "//50b.sameas" + tags_codebase,
        "sample": "//51b.sample" + tags_codebase,
        "schema": "//55b.schema" + tags_codebase,
        "topic": "//55b.topic" + tags_codebase,
        "triples": "//51b.triples" + tags_codebase,
        "users": "//29b.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

