
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//116a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//89a.account" + tags_codebase,
        "appeditor": "//90a.appeditor" + tags_codebase,
        "apps": "//91a.apps" + tags_codebase,
        "create": "//86a.create" + tags_codebase,
        "data": "//87a.data" + tags_codebase,
        "formbuilder": "//33a.formbuilder" + tags_codebase,
        "i18n": "//33a.i18n" + tags_codebase,
        "mdo": "//67a.mdo" + tags_codebase,
        "policies": "//89a.policies" + tags_codebase,
        "query": "//86a.query" + tags_codebase,
        "review": "//68a.review" + tags_codebase,
        "sample": "//88a.sample" + tags_codebase,
        "schema": "//94a.schema" + tags_codebase,
        "search": "//17a.search" + tags_codebase,
        "topic": "//92a.topic" + tags_codebase,
        "triples": "//88a.triples" + tags_codebase,
        "users": "//66a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

