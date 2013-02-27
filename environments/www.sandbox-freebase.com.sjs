
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//114a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//87a.account" + tags_codebase,
        "appeditor": "//88a.appeditor" + tags_codebase,
        "apps": "//89a.apps" + tags_codebase,
        "create": "//84a.create" + tags_codebase,
        "data": "//85a.data" + tags_codebase,
        "formbuilder": "//31a.formbuilder" + tags_codebase,
        "i18n": "//31a.i18n" + tags_codebase,
        "mdo": "//65a.mdo" + tags_codebase,
        "policies": "//87a.policies" + tags_codebase,
        "query": "//84a.query" + tags_codebase,
        "review": "//66a.review" + tags_codebase,
        "sample": "//86a.sample" + tags_codebase,
        "schema": "//92a.schema" + tags_codebase,
        "search": "//15a.search" + tags_codebase,
        "topic": "//90a.topic" + tags_codebase,
        "triples": "//86a.triples" + tags_codebase,
        "users": "//64a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

