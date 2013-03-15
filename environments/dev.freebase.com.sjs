
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//118a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//91a.account" + tags_codebase,
        "appeditor": "//92a.appeditor" + tags_codebase,
        "apps": "//93a.apps" + tags_codebase,
        "create": "//88a.create" + tags_codebase,
        "data": "//89a.data" + tags_codebase,
        "formbuilder": "//35a.formbuilder" + tags_codebase,
        "i18n": "//35a.i18n" + tags_codebase,
        "mdo": "//69a.mdo" + tags_codebase,
        "policies": "//91a.policies" + tags_codebase,
        "query": "//88a.query" + tags_codebase,
        "review": "//70a.review" + tags_codebase,
        "sample": "//90a.sample" + tags_codebase,
        "schema": "//96a.schema" + tags_codebase,
        "search": "//19a.search" + tags_codebase,
        "topic": "//94a.topic" + tags_codebase,
        "triples": "//90a.triples" + tags_codebase,
        "users": "//68a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

