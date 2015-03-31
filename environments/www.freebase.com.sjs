
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//156b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//128a.account" + tags_codebase,
        "appeditor": "//127a.appeditor" + tags_codebase,
        "apps": "//128a.apps" + tags_codebase,
        "create": "//123a.create" + tags_codebase,
        "data": "//124a.data" + tags_codebase,
        "formbuilder": "//69a.formbuilder" + tags_codebase,
        "i18n": "//70a.i18n" + tags_codebase,
        "mdo": "//104a.mdo" + tags_codebase,
        "policies": "//126a.policies" + tags_codebase,
        "query": "//123a.query" + tags_codebase,
        "review": "//105a.review" + tags_codebase,
        "sample": "//125a.sample" + tags_codebase,
        "schema": "//131a.schema" + tags_codebase,
        "search": "//54a.search" + tags_codebase,
        "topic": "//129a.topic" + tags_codebase,
        "triples": "//125a.triples" + tags_codebase,
        "users": "//103a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

