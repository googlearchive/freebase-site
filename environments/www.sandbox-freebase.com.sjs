
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//120a.account" + tags_codebase,
        "appeditor": "//121a.appeditor" + tags_codebase,
        "apps": "//122a.apps" + tags_codebase,
        "create": "//117a.create" + tags_codebase,
        "data": "//118a.data" + tags_codebase,
        "formbuilder": "//63a.formbuilder" + tags_codebase,
        "i18n": "//64a.i18n" + tags_codebase,
        "mdo": "//98a.mdo" + tags_codebase,
        "policies": "//120a.policies" + tags_codebase,
        "query": "//117a.query" + tags_codebase,
        "review": "//99a.review" + tags_codebase,
        "sample": "//119a.sample" + tags_codebase,
        "schema": "//125a.schema" + tags_codebase,
        "search": "//48a.search" + tags_codebase,
        "topic": "//123a.topic" + tags_codebase,
        "triples": "//119a.triples" + tags_codebase,
        "users": "//97a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

