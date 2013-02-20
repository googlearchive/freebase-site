
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//110a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//83a.account" + tags_codebase,
        "appeditor": "//84a.appeditor" + tags_codebase,
        "apps": "//85a.apps" + tags_codebase,
        "create": "//80a.create" + tags_codebase,
        "data": "//81a.data" + tags_codebase,
        "formbuilder": "//27a.formbuilder" + tags_codebase,
        "i18n": "//27a.i18n" + tags_codebase,
        "mdo": "//61a.mdo" + tags_codebase,
        "policies": "//83a.policies" + tags_codebase,
        "query": "//80a.query" + tags_codebase,
        "review": "//62a.review" + tags_codebase,
        "sample": "//82a.sample" + tags_codebase,
        "schema": "//88a.schema" + tags_codebase,
        "search": "//11a.search" + tags_codebase,
        "topic": "//86a.topic" + tags_codebase,
        "triples": "//82a.triples" + tags_codebase,
        "users": "//60a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

