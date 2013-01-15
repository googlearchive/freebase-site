
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//101a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//74a.account" + tags_codebase,
        "appeditor": "//75a.appeditor" + tags_codebase,
        "apps": "//76a.apps" + tags_codebase,
        "create": "//71a.create" + tags_codebase,
        "data": "//72a.data" + tags_codebase,
        "formbuilder": "//18a.formbuilder" + tags_codebase,
        "i18n": "//18a.i18n" + tags_codebase,
        "mdo": "//52a.mdo" + tags_codebase,
        "policies": "//74a.policies" + tags_codebase,
        "query": "//71a.query" + tags_codebase,
        "review": "//53a.review" + tags_codebase,
        "sameas": "//72a.sameas" + tags_codebase,
        "sample": "//73a.sample" + tags_codebase,
        "schema": "//79a.schema" + tags_codebase,
        "search": "//2a.search" + tags_codebase,
        "topic": "//77a.topic" + tags_codebase,
        "triples": "//73a.triples" + tags_codebase,
        "users": "//51a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

