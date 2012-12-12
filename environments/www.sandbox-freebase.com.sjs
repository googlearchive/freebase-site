
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//97a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//70a.account" + tags_codebase,
        "appeditor": "//71a.appeditor" + tags_codebase,
        "apps": "//72a.apps" + tags_codebase,
        "create": "//67a.create" + tags_codebase,
        "data": "//68a.data" + tags_codebase,
        "formbuilder": "//14a.formbuilder" + tags_codebase,
        "i18n": "//14a.i18n" + tags_codebase,
        "mdo": "//48a.mdo" + tags_codebase,
        "policies": "//70a.policies" + tags_codebase,
        "query": "//67a.query" + tags_codebase,
        "review": "//49a.review" + tags_codebase,
        "sameas": "//68a.sameas" + tags_codebase,
        "sample": "//69a.sample" + tags_codebase,
        "schema": "//75a.schema" + tags_codebase,
        "topic": "//73a.topic" + tags_codebase,
        "triples": "//69a.triples" + tags_codebase,
        "users": "//47a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

