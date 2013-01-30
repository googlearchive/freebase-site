
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//104a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//77a.account" + tags_codebase,
        "appeditor": "//78a.appeditor" + tags_codebase,
        "apps": "//79a.apps" + tags_codebase,
        "create": "//74a.create" + tags_codebase,
        "data": "//75a.data" + tags_codebase,
        "formbuilder": "//21a.formbuilder" + tags_codebase,
        "i18n": "//21a.i18n" + tags_codebase,
        "mdo": "//55a.mdo" + tags_codebase,
        "policies": "//77a.policies" + tags_codebase,
        "query": "//74a.query" + tags_codebase,
        "review": "//56a.review" + tags_codebase,
        "sameas": "//75a.sameas" + tags_codebase,
        "sample": "//76a.sample" + tags_codebase,
        "schema": "//82a.schema" + tags_codebase,
        "search": "//5a.search" + tags_codebase,
        "topic": "//80a.topic" + tags_codebase,
        "triples": "//76a.triples" + tags_codebase,
        "users": "//54a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

