
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//148a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//121a.account" + tags_codebase,
        "appeditor": "//122a.appeditor" + tags_codebase,
        "apps": "//123a.apps" + tags_codebase,
        "create": "//118a.create" + tags_codebase,
        "data": "//119a.data" + tags_codebase,
        "formbuilder": "//64a.formbuilder" + tags_codebase,
        "i18n": "//65a.i18n" + tags_codebase,
        "mdo": "//99a.mdo" + tags_codebase,
        "policies": "//121a.policies" + tags_codebase,
        "query": "//118a.query" + tags_codebase,
        "review": "//100a.review" + tags_codebase,
        "sample": "//120a.sample" + tags_codebase,
        "schema": "//126a.schema" + tags_codebase,
        "search": "//49a.search" + tags_codebase,
        "topic": "//124a.topic" + tags_codebase,
        "triples": "//120a.triples" + tags_codebase,
        "users": "//98a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

