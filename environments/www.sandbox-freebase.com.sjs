
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//105b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//78b.account" + tags_codebase,
        "appeditor": "//79b.appeditor" + tags_codebase,
        "apps": "//80b.apps" + tags_codebase,
        "create": "//75b.create" + tags_codebase,
        "data": "//76b.data" + tags_codebase,
        "formbuilder": "//22b.formbuilder" + tags_codebase,
        "i18n": "//22b.i18n" + tags_codebase,
        "mdo": "//56b.mdo" + tags_codebase,
        "policies": "//78b.policies" + tags_codebase,
        "query": "//75b.query" + tags_codebase,
        "review": "//57b.review" + tags_codebase,
        "sample": "//77a.sample" + tags_codebase,
        "schema": "//83a.schema" + tags_codebase,
        "search": "//6a.search" + tags_codebase,
        "topic": "//81a.topic" + tags_codebase,
        "triples": "//77a.triples" + tags_codebase,
        "users": "//55a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

