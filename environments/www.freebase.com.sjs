
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//139a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//112b.account" + tags_codebase,
        "appeditor": "//113a.appeditor" + tags_codebase,
        "apps": "//114a.apps" + tags_codebase,
        "create": "//109a.create" + tags_codebase,
        "data": "//110a.data" + tags_codebase,
        "formbuilder": "//55a.formbuilder" + tags_codebase,
        "i18n": "//56a.i18n" + tags_codebase,
        "mdo": "//90a.mdo" + tags_codebase,
        "policies": "//112a.policies" + tags_codebase,
        "query": "//109a.query" + tags_codebase,
        "review": "//91a.review" + tags_codebase,
        "sample": "//111a.sample" + tags_codebase,
        "schema": "//117a.schema" + tags_codebase,
        "search": "//40a.search" + tags_codebase,
        "topic": "//115a.topic" + tags_codebase,
        "triples": "//111a.triples" + tags_codebase,
        "users": "//89a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

