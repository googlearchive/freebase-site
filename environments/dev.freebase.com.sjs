
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//88a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//61a.account" + tags_codebase,
        "appeditor": "//62a.appeditor" + tags_codebase,
        "apps": "//63a.apps" + tags_codebase,
        "create": "//58a.create" + tags_codebase,
        "data": "//59a.data" + tags_codebase,
        "formbuilder": "//6a.formbuilder" + tags_codebase,
        "i18n": "//6a.i18n" + tags_codebase,
        "mdo": "//40a.mdo" + tags_codebase,
        "policies": "//62a.policies" + tags_codebase,
        "query": "//59a.query" + tags_codebase,
        "review": "//41a.review" + tags_codebase,
        "sameas": "//60a.sameas" + tags_codebase,
        "sample": "//61a.sample" + tags_codebase,
        "schema": "//67a.schema" + tags_codebase,
        "topic": "//65a.topic" + tags_codebase,
        "triples": "//61a.triples" + tags_codebase,
        "users": "//39a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

