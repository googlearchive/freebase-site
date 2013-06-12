
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//135a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//108a.account" + tags_codebase,
        "appeditor": "//109a.appeditor" + tags_codebase,
        "apps": "//110a.apps" + tags_codebase,
        "create": "//105a.create" + tags_codebase,
        "data": "//106a.data" + tags_codebase,
        "formbuilder": "//51a.formbuilder" + tags_codebase,
        "i18n": "//52a.i18n" + tags_codebase,
        "mdo": "//mdo" + codebase,
        "policies": "//108a.policies" + tags_codebase,
        "query": "//105a.query" + tags_codebase,
        "review": "//87a.review" + tags_codebase,
        "sample": "//107a.sample" + tags_codebase,
        "schema": "//113a.schema" + tags_codebase,
        "search": "//36a.search" + tags_codebase,
        "topic": "//111a.topic" + tags_codebase,
        "triples": "//107a.triples" + tags_codebase,
        "users": "//85a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

