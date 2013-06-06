
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//134a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//107b.account" + tags_codebase,
        "appeditor": "//108a.appeditor" + tags_codebase,
        "apps": "//109a.apps" + tags_codebase,
        "create": "//104a.create" + tags_codebase,
        "data": "//105a.data" + tags_codebase,
        "formbuilder": "//50a.formbuilder" + tags_codebase,
        "i18n": "//51a.i18n" + tags_codebase,
        "mdo": "//85a.mdo" + tags_codebase,
        "policies": "//107a.policies" + tags_codebase,
        "query": "//104a.query" + tags_codebase,
        "review": "//86a.review" + tags_codebase,
        "sample": "//106a.sample" + tags_codebase,
        "schema": "//112a.schema" + tags_codebase,
        "search": "//35a.search" + tags_codebase,
        "topic": "//110a.topic" + tags_codebase,
        "triples": "//106a.triples" + tags_codebase,
        "users": "//84a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

