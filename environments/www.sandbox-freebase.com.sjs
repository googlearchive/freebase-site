
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//112a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//85a.account" + tags_codebase,
        "appeditor": "//86a.appeditor" + tags_codebase,
        "apps": "//87a.apps" + tags_codebase,
        "create": "//82a.create" + tags_codebase,
        "data": "//83a.data" + tags_codebase,
        "formbuilder": "//29a.formbuilder" + tags_codebase,
        "i18n": "//29a.i18n" + tags_codebase,
        "mdo": "//63a.mdo" + tags_codebase,
        "policies": "//85a.policies" + tags_codebase,
        "query": "//82a.query" + tags_codebase,
        "review": "//64a.review" + tags_codebase,
        "sample": "//84a.sample" + tags_codebase,
        "schema": "//90a.schema" + tags_codebase,
        "search": "//13a.search" + tags_codebase,
        "topic": "//88a.topic" + tags_codebase,
        "triples": "//84a.triples" + tags_codebase,
        "users": "//62a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

