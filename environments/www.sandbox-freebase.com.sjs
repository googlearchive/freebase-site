
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//106a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//79a.account" + tags_codebase,
        "appeditor": "//80a.appeditor" + tags_codebase,
        "apps": "//81a.apps" + tags_codebase,
        "create": "//76a.create" + tags_codebase,
        "data": "//77a.data" + tags_codebase,
        "formbuilder": "//23a.formbuilder" + tags_codebase,
        "i18n": "//23a.i18n" + tags_codebase,
        "mdo": "//57a.mdo" + tags_codebase,
        "policies": "//79a.policies" + tags_codebase,
        "query": "//76a.query" + tags_codebase,
        "review": "//58a.review" + tags_codebase,
        "sample": "//78a.sample" + tags_codebase,
        "schema": "//84a.schema" + tags_codebase,
        "search": "//7a.search" + tags_codebase,
        "topic": "//82a.topic" + tags_codebase,
        "triples": "//78a.triples" + tags_codebase,
        "users": "//56a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

