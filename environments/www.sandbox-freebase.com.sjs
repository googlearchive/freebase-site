
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//146a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//119a.account" + tags_codebase,
        "appeditor": "//120a.appeditor" + tags_codebase,
        "apps": "//121a.apps" + tags_codebase,
        "create": "//116a.create" + tags_codebase,
        "data": "//117a.data" + tags_codebase,
        "formbuilder": "//62a.formbuilder" + tags_codebase,
        "i18n": "//63a.i18n" + tags_codebase,
        "mdo": "//97a.mdo" + tags_codebase,
        "policies": "//119a.policies" + tags_codebase,
        "query": "//116a.query" + tags_codebase,
        "review": "//98a.review" + tags_codebase,
        "sample": "//118a.sample" + tags_codebase,
        "schema": "//124a.schema" + tags_codebase,
        "search": "//47a.search" + tags_codebase,
        "topic": "//122a.topic" + tags_codebase,
        "triples": "//118a.triples" + tags_codebase,
        "users": "//96a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

