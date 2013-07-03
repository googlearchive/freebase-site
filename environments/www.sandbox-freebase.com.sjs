
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//137a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//110a.account" + tags_codebase,
        "appeditor": "//111a.appeditor" + tags_codebase,
        "apps": "//112a.apps" + tags_codebase,
        "create": "//107a.create" + tags_codebase,
        "data": "//108a.data" + tags_codebase,
        "formbuilder": "//53a.formbuilder" + tags_codebase,
        "i18n": "//54a.i18n" + tags_codebase,
        "mdo": "//88a.mdo" + tags_codebase,
        "policies": "//110a.policies" + tags_codebase,
        "query": "//107a.query" + tags_codebase,
        "review": "//89a.review" + tags_codebase,
        "sample": "//109a.sample" + tags_codebase,
        "schema": "//115a.schema" + tags_codebase,
        "search": "//38a.search" + tags_codebase,
        "topic": "//113a.topic" + tags_codebase,
        "triples": "//109a.triples" + tags_codebase,
        "users": "//87a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

