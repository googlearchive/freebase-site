
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//81b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//54b.account" + tags_codebase,
        "appeditor": "//55b.appeditor" + tags_codebase,
        "apps": "//56b.apps" + tags_codebase,
        "create": "//51b.create" + tags_codebase,
        "data": "//52b.data" + tags_codebase,
        "mdo": "//33a.mdo" + tags_codebase,
        "policies": "//55a.policies" + tags_codebase,
        "query": "//52a.query" + tags_codebase,
        "review": "//34a.review" + tags_codebase,
        "sameas": "//53a.sameas" + tags_codebase,
        "sample": "//54a.sample" + tags_codebase,
        "schema": "//60a.schema" + tags_codebase,
        "topic": "//58a.topic" + tags_codebase,
        "triples": "//54a.triples" + tags_codebase,
        "users": "//32a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

