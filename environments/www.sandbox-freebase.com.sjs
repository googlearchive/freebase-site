
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//149a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//122a.account" + tags_codebase,
        "appeditor": "//123a.appeditor" + tags_codebase,
        "apps": "//124a.apps" + tags_codebase,
        "create": "//119a.create" + tags_codebase,
        "data": "//120a.data" + tags_codebase,
        "formbuilder": "//65a.formbuilder" + tags_codebase,
        "i18n": "//66a.i18n" + tags_codebase,
        "mdo": "//100a.mdo" + tags_codebase,
        "policies": "//122a.policies" + tags_codebase,
        "query": "//119a.query" + tags_codebase,
        "review": "//101a.review" + tags_codebase,
        "sample": "//121a.sample" + tags_codebase,
        "schema": "//127a.schema" + tags_codebase,
        "search": "//50a.search" + tags_codebase,
        "topic": "//125a.topic" + tags_codebase,
        "triples": "//121a.triples" + tags_codebase,
        "users": "//99a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

