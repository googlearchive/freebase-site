
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//95a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//68a.account" + tags_codebase,
        "appeditor": "//69a.appeditor" + tags_codebase,
        "apps": "//70a.apps" + tags_codebase,
        "create": "//65a.create" + tags_codebase,
        "data": "//66a.data" + tags_codebase,
        "formbuilder": "//12a.formbuilder" + tags_codebase,
        "i18n": "//12a.i18n" + tags_codebase,
        "mdo": "//46a.mdo" + tags_codebase,
        "policies": "//68a.policies" + tags_codebase,
        "query": "//65a.query" + tags_codebase,
        "review": "//47a.review" + tags_codebase,
        "sameas": "//66a.sameas" + tags_codebase,
        "sample": "//67a.sample" + tags_codebase,
        "schema": "//73a.schema" + tags_codebase,
        "topic": "//71a.topic" + tags_codebase,
        "triples": "//67a.triples" + tags_codebase,
        "users": "//45a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

