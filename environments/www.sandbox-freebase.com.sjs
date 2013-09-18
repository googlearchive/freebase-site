
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//143a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//116a.account" + tags_codebase,
        "appeditor": "//117a.appeditor" + tags_codebase,
        "apps": "//118a.apps" + tags_codebase,
        "create": "//113a.create" + tags_codebase,
        "data": "//114a.data" + tags_codebase,
        "formbuilder": "//59a.formbuilder" + tags_codebase,
        "i18n": "//60a.i18n" + tags_codebase,
        "mdo": "//94a.mdo" + tags_codebase,
        "policies": "//116a.policies" + tags_codebase,
        "query": "//113a.query" + tags_codebase,
        "review": "//95a.review" + tags_codebase,
        "sample": "//115a.sample" + tags_codebase,
        "schema": "//121a.schema" + tags_codebase,
        "search": "//44a.search" + tags_codebase,
        "topic": "//119a.topic" + tags_codebase,
        "triples": "//115a.triples" + tags_codebase,
        "users": "//93a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

