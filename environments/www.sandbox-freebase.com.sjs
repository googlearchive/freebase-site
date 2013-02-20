
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//111a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//84a.account" + tags_codebase,
        "appeditor": "//85a.appeditor" + tags_codebase,
        "apps": "//86a.apps" + tags_codebase,
        "create": "//81a.create" + tags_codebase,
        "data": "//82a.data" + tags_codebase,
        "formbuilder": "//28a.formbuilder" + tags_codebase,
        "i18n": "//28a.i18n" + tags_codebase,
        "mdo": "//62a.mdo" + tags_codebase,
        "policies": "//84a.policies" + tags_codebase,
        "query": "//81a.query" + tags_codebase,
        "review": "//63a.review" + tags_codebase,
        "sample": "//83a.sample" + tags_codebase,
        "schema": "//89a.schema" + tags_codebase,
        "search": "//12a.search" + tags_codebase,
        "topic": "//87a.topic" + tags_codebase,
        "triples": "//83a.triples" + tags_codebase,
        "users": "//61a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

