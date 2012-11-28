
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//67a.account" + tags_codebase,
        "appeditor": "//68a.appeditor" + tags_codebase,
        "apps": "//69a.apps" + tags_codebase,
        "create": "//64a.create" + tags_codebase,
        "data": "//65a.data" + tags_codebase,
        "formbuilder": "//11a.formbuilder" + tags_codebase,
        "i18n": "//11a.i18n" + tags_codebase,
        "mdo": "//45a.mdo" + tags_codebase,
        "policies": "//67a.policies" + tags_codebase,
        "query": "//64a.query" + tags_codebase,
        "review": "//46a.review" + tags_codebase,
        "sameas": "//65a.sameas" + tags_codebase,
        "sample": "//66a.sample" + tags_codebase,
        "schema": "//72a.schema" + tags_codebase,
        "topic": "//70a.topic" + tags_codebase,
        "triples": "//66a.triples" + tags_codebase,
        "users": "//44a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

