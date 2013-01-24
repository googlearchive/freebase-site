
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//103a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//76a.account" + tags_codebase,
        "appeditor": "//77a.appeditor" + tags_codebase,
        "apps": "//78a.apps" + tags_codebase,
        "create": "//73a.create" + tags_codebase,
        "data": "//74a.data" + tags_codebase,
        "formbuilder": "//20a.formbuilder" + tags_codebase,
        "i18n": "//20a.i18n" + tags_codebase,
        "mdo": "//54a.mdo" + tags_codebase,
        "policies": "//76a.policies" + tags_codebase,
        "query": "//73a.query" + tags_codebase,
        "review": "//55a.review" + tags_codebase,
        "sameas": "//74a.sameas" + tags_codebase,
        "sample": "//75a.sample" + tags_codebase,
        "schema": "//81a.schema" + tags_codebase,
        "search": "//4a.search" + tags_codebase,
        "topic": "//79a.topic" + tags_codebase,
        "triples": "//75a.triples" + tags_codebase,
        "users": "//53a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

