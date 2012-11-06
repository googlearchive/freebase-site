
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//92a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//65a.account" + tags_codebase,
        "appeditor": "//66a.appeditor" + tags_codebase,
        "apps": "//67a.apps" + tags_codebase,
        "create": "//62a.create" + tags_codebase,
        "data": "//63a.data" + tags_codebase,
        "formbuilder": "//9a.formbuilder" + tags_codebase,
        "i18n": "//9a.i18n" + tags_codebase,
        "mdo": "//43a.mdo" + tags_codebase,
        "policies": "//65a.policies" + tags_codebase,
        "query": "//62a.query" + tags_codebase,
        "review": "//44a.review" + tags_codebase,
        "sameas": "//63a.sameas" + tags_codebase,
        "sample": "//64a.sample" + tags_codebase,
        "schema": "//70a.schema" + tags_codebase,
        "topic": "//68a.topic" + tags_codebase,
        "triples": "//64a.triples" + tags_codebase,
        "users": "//42a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

