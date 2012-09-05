
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//82a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//55a.account" + tags_codebase,
        "appeditor": "//56a.appeditor" + tags_codebase,
        "apps": "//57a.apps" + tags_codebase,
        "create": "//52a.create" + tags_codebase,
        "data": "//53a.data" + tags_codebase,
        "mdo": "//34a.mdo" + tags_codebase,
        "policies": "//56a.policies" + tags_codebase,
        "query": "//53a.query" + tags_codebase,
        "review": "//35a.review" + tags_codebase,
        "sameas": "//54a.sameas" + tags_codebase,
        "sample": "//55a.sample" + tags_codebase,
        "schema": "//61a.schema" + tags_codebase,
        "topic": "//59a.topic" + tags_codebase,
        "triples": "//55a.triples" + tags_codebase,
        "users": "//33a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

