
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//98a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//71a.account" + tags_codebase,
        "appeditor": "//72a.appeditor" + tags_codebase,
        "apps": "//73a.apps" + tags_codebase,
        "create": "//68a.create" + tags_codebase,
        "data": "//69a.data" + tags_codebase,
        "formbuilder": "//15a.formbuilder" + tags_codebase,
        "i18n": "//15a.i18n" + tags_codebase,
        "mdo": "//49a.mdo" + tags_codebase,
        "policies": "//71a.policies" + tags_codebase,
        "query": "//68a.query" + tags_codebase,
        "review": "//50a.review" + tags_codebase,
        "sameas": "//69a.sameas" + tags_codebase,
        "sample": "//70a.sample" + tags_codebase,
        "schema": "//76a.schema" + tags_codebase,
        "topic": "//74a.topic" + tags_codebase,
        "triples": "//70a.triples" + tags_codebase,
        "users": "//48a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

