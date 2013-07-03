
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//138a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//111a.account" + tags_codebase,
        "appeditor": "//112a.appeditor" + tags_codebase,
        "apps": "//113a.apps" + tags_codebase,
        "create": "//108a.create" + tags_codebase,
        "data": "//109a.data" + tags_codebase,
        "formbuilder": "//54a.formbuilder" + tags_codebase,
        "i18n": "//55a.i18n" + tags_codebase,
        "mdo": "//89a.mdo" + tags_codebase,
        "policies": "//111a.policies" + tags_codebase,
        "query": "//108a.query" + tags_codebase,
        "review": "//90a.review" + tags_codebase,
        "sample": "//110a.sample" + tags_codebase,
        "schema": "//116a.schema" + tags_codebase,
        "search": "//39a.search" + tags_codebase,
        "topic": "//114a.topic" + tags_codebase,
        "triples": "//110a.triples" + tags_codebase,
        "users": "//88a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

