
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//132a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//105d.account" + tags_codebase,
        "appeditor": "//106a.appeditor" + tags_codebase,
        "apps": "//107a.apps" + tags_codebase,
        "create": "//102a.create" + tags_codebase,
        "data": "//103a.data" + tags_codebase,
        "formbuilder": "//48a.formbuilder" + tags_codebase,
        "i18n": "//49a.i18n" + tags_codebase,
        "mdo": "//83a.mdo" + tags_codebase,
        "policies": "//105a.policies" + tags_codebase,
        "query": "//102a.query" + tags_codebase,
        "review": "//84a.review" + tags_codebase,
        "sample": "//104a.sample" + tags_codebase,
        "schema": "//110a.schema" + tags_codebase,
        "search": "//33a.search" + tags_codebase,
        "topic": "//108a.topic" + tags_codebase,
        "triples": "//104a.triples" + tags_codebase,
        "users": "//82a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

