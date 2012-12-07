
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//96a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//69a.account" + tags_codebase,
        "appeditor": "//70a.appeditor" + tags_codebase,
        "apps": "//71a.apps" + tags_codebase,
        "create": "//66a.create" + tags_codebase,
        "data": "//67a.data" + tags_codebase,
        "formbuilder": "//13a.formbuilder" + tags_codebase,
        "i18n": "//13a.i18n" + tags_codebase,
        "mdo": "//47a.mdo" + tags_codebase,
        "policies": "//69a.policies" + tags_codebase,
        "query": "//66a.query" + tags_codebase,
        "review": "//48a.review" + tags_codebase,
        "sameas": "//67a.sameas" + tags_codebase,
        "sample": "//68a.sample" + tags_codebase,
        "schema": "//74a.schema" + tags_codebase,
        "topic": "//72a.topic" + tags_codebase,
        "triples": "//68a.triples" + tags_codebase,
        "users": "//46a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

