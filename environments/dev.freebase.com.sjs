
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//83a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//56a.account" + tags_codebase,
        "appeditor": "//57a.appeditor" + tags_codebase,
        "apps": "//58a.apps" + tags_codebase,
        "create": "//53a.create" + tags_codebase,
        "data": "//54a.data" + tags_codebase,
        "formbuilder": "//1a.formbuilder" + tags_codebase,
        "i18n": "//1a.i18n" + tags_codebase,
        "mdo": "//35a.mdo" + tags_codebase,
        "policies": "//57a.policies" + tags_codebase,
        "query": "//54a.query" + tags_codebase,
        "review": "//36a.review" + tags_codebase,
        "sameas": "//55a.sameas" + tags_codebase,
        "sample": "//56a.sample" + tags_codebase,
        "schema": "//62a.schema" + tags_codebase,
        "topic": "//60a.topic" + tags_codebase,
        "triples": "//56a.triples" + tags_codebase,
        "users": "//34a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

