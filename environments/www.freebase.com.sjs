
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//133a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//106a.account" + tags_codebase,
        "appeditor": "//107a.appeditor" + tags_codebase,
        "apps": "//108a.apps" + tags_codebase,
        "create": "//103a.create" + tags_codebase,
        "data": "//104a.data" + tags_codebase,
        "formbuilder": "//49a.formbuilder" + tags_codebase,
        "i18n": "//50a.i18n" + tags_codebase,
        "mdo": "//84a.mdo" + tags_codebase,
        "policies": "//106a.policies" + tags_codebase,
        "query": "//103a.query" + tags_codebase,
        "review": "//85a.review" + tags_codebase,
        "sample": "//105a.sample" + tags_codebase,
        "schema": "//111a.schema" + tags_codebase,
        "search": "//34a.search" + tags_codebase,
        "topic": "//109a.topic" + tags_codebase,
        "triples": "//105a.triples" + tags_codebase,
        "users": "//83a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

