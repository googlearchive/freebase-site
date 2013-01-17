
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//102a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//75a.account" + tags_codebase,
        "appeditor": "//76a.appeditor" + tags_codebase,
        "apps": "//77a.apps" + tags_codebase,
        "create": "//72a.create" + tags_codebase,
        "data": "//73a.data" + tags_codebase,
        "formbuilder": "//19a.formbuilder" + tags_codebase,
        "i18n": "//19a.i18n" + tags_codebase,
        "mdo": "//53a.mdo" + tags_codebase,
        "policies": "//75a.policies" + tags_codebase,
        "query": "//72a.query" + tags_codebase,
        "review": "//54a.review" + tags_codebase,
        "sameas": "//73a.sameas" + tags_codebase,
        "sample": "//74a.sample" + tags_codebase,
        "schema": "//80a.schema" + tags_codebase,
        "search": "//3a.search" + tags_codebase,
        "topic": "//78a.topic" + tags_codebase,
        "triples": "//74a.triples" + tags_codebase,
        "users": "//52a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

