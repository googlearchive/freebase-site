
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//136a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//109a.account" + tags_codebase,
        "appeditor": "//110a.appeditor" + tags_codebase,
        "apps": "//111a.apps" + tags_codebase,
        "create": "//106a.create" + tags_codebase,
        "data": "//107a.data" + tags_codebase,
        "formbuilder": "//52a.formbuilder" + tags_codebase,
        "i18n": "//53a.i18n" + tags_codebase,
        "mdo": "//87a.mdo" + tags_codebase,
        "policies": "//109a.policies" + tags_codebase,
        "query": "//106a.query" + tags_codebase,
        "review": "//88a.review" + tags_codebase,
        "sample": "//108a.sample" + tags_codebase,
        "schema": "//114a.schema" + tags_codebase,
        "search": "//37a.search" + tags_codebase,
        "topic": "//112a.topic" + tags_codebase,
        "triples": "//108a.triples" + tags_codebase,
        "users": "//86a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

