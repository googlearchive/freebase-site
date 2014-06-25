
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//150a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//123a.account" + tags_codebase,
        "appeditor": "//124a.appeditor" + tags_codebase,
        "apps": "//125a.apps" + tags_codebase,
        "create": "//120a.create" + tags_codebase,
        "data": "//121a.data" + tags_codebase,
        "formbuilder": "//66a.formbuilder" + tags_codebase,
        "i18n": "//67a.i18n" + tags_codebase,
        "mdo": "//101a.mdo" + tags_codebase,
        "policies": "//123a.policies" + tags_codebase,
        "query": "//120a.query" + tags_codebase,
        "review": "//102a.review" + tags_codebase,
        "sample": "//122a.sample" + tags_codebase,
        "schema": "//128a.schema" + tags_codebase,
        "search": "//51a.search" + tags_codebase,
        "topic": "//126a.topic" + tags_codebase,
        "triples": "//122a.triples" + tags_codebase,
        "users": "//100a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

