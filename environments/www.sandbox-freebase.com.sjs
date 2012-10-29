
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//90a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//63a.account" + tags_codebase,
        "appeditor": "//64a.appeditor" + tags_codebase,
        "apps": "//65a.apps" + tags_codebase,
        "create": "//60a.create" + tags_codebase,
        "data": "//61a.data" + tags_codebase,
        "formbuilder": "//7a.formbuilder" + tags_codebase,
        "i18n": "//7a.i18n" + tags_codebase,
        "mdo": "//41a.mdo" + tags_codebase,
        "policies": "//63a.policies" + tags_codebase,
        "query": "//60a.query" + tags_codebase,
        "review": "//42a.review" + tags_codebase,
        "sameas": "//61a.sameas" + tags_codebase,
        "sample": "//62a.sample" + tags_codebase,
        "schema": "//68a.schema" + tags_codebase,
        "topic": "//66a.topic" + tags_codebase,
        "triples": "//62a.triples" + tags_codebase,
        "users": "//40a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

