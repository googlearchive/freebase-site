
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//152a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//125a.account" + tags_codebase,
        "appeditor": "//125a.appeditor" + tags_codebase,
        "apps": "//126a.apps" + tags_codebase,
        "create": "//121a.create" + tags_codebase,
        "data": "//122a.data" + tags_codebase,
        "formbuilder": "//67a.formbuilder" + tags_codebase,
        "i18n": "//68a.i18n" + tags_codebase,
        "mdo": "//102a.mdo" + tags_codebase,
        "policies": "//124a.policies" + tags_codebase,
        "query": "//121a.query" + tags_codebase,
        "review": "//103a.review" + tags_codebase,
        "sample": "//123a.sample" + tags_codebase,
        "schema": "//129a.schema" + tags_codebase,
        "search": "//52a.search" + tags_codebase,
        "topic": "//127a.topic" + tags_codebase,
        "triples": "//123a.triples" + tags_codebase,
        "users": "//101a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

