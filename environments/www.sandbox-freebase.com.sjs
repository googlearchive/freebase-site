
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//144a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//117a.account" + tags_codebase,
        "appeditor": "//118a.appeditor" + tags_codebase,
        "apps": "//119a.apps" + tags_codebase,
        "create": "//114a.create" + tags_codebase,
        "data": "//115a.data" + tags_codebase,
        "formbuilder": "//60a.formbuilder" + tags_codebase,
        "i18n": "//61a.i18n" + tags_codebase,
        "mdo": "//95a.mdo" + tags_codebase,
        "policies": "//117a.policies" + tags_codebase,
        "query": "//114a.query" + tags_codebase,
        "review": "//96a.review" + tags_codebase,
        "sample": "//116a.sample" + tags_codebase,
        "schema": "//122a.schema" + tags_codebase,
        "search": "//45a.search" + tags_codebase,
        "topic": "//120a.topic" + tags_codebase,
        "triples": "//116a.triples" + tags_codebase,
        "users": "//94a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

