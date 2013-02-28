
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//115a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//88a.account" + tags_codebase,
        "appeditor": "//89a.appeditor" + tags_codebase,
        "apps": "//90a.apps" + tags_codebase,
        "create": "//85a.create" + tags_codebase,
        "data": "//86a.data" + tags_codebase,
        "formbuilder": "//32a.formbuilder" + tags_codebase,
        "i18n": "//32a.i18n" + tags_codebase,
        "mdo": "//66a.mdo" + tags_codebase,
        "policies": "//88a.policies" + tags_codebase,
        "query": "//85a.query" + tags_codebase,
        "review": "//67a.review" + tags_codebase,
        "sample": "//87a.sample" + tags_codebase,
        "schema": "//93a.schema" + tags_codebase,
        "search": "//16a.search" + tags_codebase,
        "topic": "//91a.topic" + tags_codebase,
        "triples": "//87a.triples" + tags_codebase,
        "users": "//65a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

