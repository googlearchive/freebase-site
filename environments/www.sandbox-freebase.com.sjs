
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//141a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//114a.account" + tags_codebase,
        "appeditor": "//115a.appeditor" + tags_codebase,
        "apps": "//116a.apps" + tags_codebase,
        "create": "//111a.create" + tags_codebase,
        "data": "//112a.data" + tags_codebase,
        "formbuilder": "//57a.formbuilder" + tags_codebase,
        "i18n": "//58a.i18n" + tags_codebase,
        "mdo": "//92a.mdo" + tags_codebase,
        "policies": "//114a.policies" + tags_codebase,
        "query": "//111a.query" + tags_codebase,
        "review": "//93a.review" + tags_codebase,
        "sample": "//113a.sample" + tags_codebase,
        "schema": "//119a.schema" + tags_codebase,
        "search": "//42a.search" + tags_codebase,
        "topic": "//117a.topic" + tags_codebase,
        "triples": "//113a.triples" + tags_codebase,
        "users": "//91a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

