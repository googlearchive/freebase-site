
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//91a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//64a.account" + tags_codebase,
        "appeditor": "//65a.appeditor" + tags_codebase,
        "apps": "//66a.apps" + tags_codebase,
        "create": "//61a.create" + tags_codebase,
        "data": "//62a.data" + tags_codebase,
        "formbuilder": "//8a.formbuilder" + tags_codebase,
        "i18n": "//8a.i18n" + tags_codebase,
        "mdo": "//42a.mdo" + tags_codebase,
        "policies": "//64a.policies" + tags_codebase,
        "query": "//61a.query" + tags_codebase,
        "review": "//43a.review" + tags_codebase,
        "sameas": "//62a.sameas" + tags_codebase,
        "sample": "//63a.sample" + tags_codebase,
        "schema": "//69a.schema" + tags_codebase,
        "topic": "//67a.topic" + tags_codebase,
        "triples": "//63a.triples" + tags_codebase,
        "users": "//41a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

