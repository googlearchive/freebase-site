
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//155a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//127a.account" + tags_codebase,
        "appeditor": "//126a.appeditor" + tags_codebase,
        "apps": "//127a.apps" + tags_codebase,
        "create": "//122a.create" + tags_codebase,
        "data": "//123a.data" + tags_codebase,
        "formbuilder": "//68a.formbuilder" + tags_codebase,
        "i18n": "//69a.i18n" + tags_codebase,
        "mdo": "//103a.mdo" + tags_codebase,
        "policies": "//125a.policies" + tags_codebase,
        "query": "//122a.query" + tags_codebase,
        "review": "//104a.review" + tags_codebase,
        "sample": "//124a.sample" + tags_codebase,
        "schema": "//130a.schema" + tags_codebase,
        "search": "//53a.search" + tags_codebase,
        "topic": "//128a.topic" + tags_codebase,
        "triples": "//124a.triples" + tags_codebase,
        "users": "//102a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

