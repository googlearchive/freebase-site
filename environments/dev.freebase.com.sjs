
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//93a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//66a.account" + tags_codebase,
        "appeditor": "//67a.appeditor" + tags_codebase,
        "apps": "//68a.apps" + tags_codebase,
        "create": "//63a.create" + tags_codebase,
        "data": "//64a.data" + tags_codebase,
        "formbuilder": "//10a.formbuilder" + tags_codebase,
        "i18n": "//10a.i18n" + tags_codebase,
        "mdo": "//44a.mdo" + tags_codebase,
        "policies": "//66a.policies" + tags_codebase,
        "query": "//63a.query" + tags_codebase,
        "review": "//45a.review" + tags_codebase,
        "sameas": "//64a.sameas" + tags_codebase,
        "sample": "//65a.sample" + tags_codebase,
        "schema": "//71a.schema" + tags_codebase,
        "topic": "//69a.topic" + tags_codebase,
        "triples": "//65a.triples" + tags_codebase,
        "users": "//43a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

