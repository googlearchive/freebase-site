
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//84a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//57a.account" + tags_codebase,
        "appeditor": "//58a.appeditor" + tags_codebase,
        "apps": "//59a.apps" + tags_codebase,
        "create": "//54a.create" + tags_codebase,
        "data": "//55a.data" + tags_codebase,
        "formbuilder": "//2a.formbuilder" + tags_codebase,
        "i18n": "//2a.i18n" + tags_codebase,
        "mdo": "//36a.mdo" + tags_codebase,
        "policies": "//58a.policies" + tags_codebase,
        "query": "//55a.query" + tags_codebase,
        "review": "//37a.review" + tags_codebase,
        "sameas": "//56a.sameas" + tags_codebase,
        "sample": "//57a.sample" + tags_codebase,
        "schema": "//63a.schema" + tags_codebase,
        "topic": "//61a.topic" + tags_codebase,
        "triples": "//57a.triples" + tags_codebase,
        "users": "//35a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

