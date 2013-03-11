
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//117a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//90a.account" + tags_codebase,
        "appeditor": "//91a.appeditor" + tags_codebase,
        "apps": "//92a.apps" + tags_codebase,
        "create": "//87a.create" + tags_codebase,
        "data": "//88a.data" + tags_codebase,
        "formbuilder": "//34a.formbuilder" + tags_codebase,
        "i18n": "//34a.i18n" + tags_codebase,
        "mdo": "//68a.mdo" + tags_codebase,
        "policies": "//90a.policies" + tags_codebase,
        "query": "//87a.query" + tags_codebase,
        "review": "//69a.review" + tags_codebase,
        "sample": "//89a.sample" + tags_codebase,
        "schema": "//95a.schema" + tags_codebase,
        "search": "//18a.search" + tags_codebase,
        "topic": "//93a.topic" + tags_codebase,
        "triples": "//89a.triples" + tags_codebase,
        "users": "//67a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

