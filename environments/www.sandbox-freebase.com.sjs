
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//140a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//113a.account" + tags_codebase,
        "appeditor": "//114a.appeditor" + tags_codebase,
        "apps": "//115a.apps" + tags_codebase,
        "create": "//110a.create" + tags_codebase,
        "data": "//111a.data" + tags_codebase,
        "formbuilder": "//56a.formbuilder" + tags_codebase,
        "i18n": "//57a.i18n" + tags_codebase,
        "mdo": "//91a.mdo" + tags_codebase,
        "policies": "//113a.policies" + tags_codebase,
        "query": "//110a.query" + tags_codebase,
        "review": "//92a.review" + tags_codebase,
        "sample": "//112a.sample" + tags_codebase,
        "schema": "//118a.schema" + tags_codebase,
        "search": "//41a.search" + tags_codebase,
        "topic": "//116a.topic" + tags_codebase,
        "triples": "//112a.triples" + tags_codebase,
        "users": "//90a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

