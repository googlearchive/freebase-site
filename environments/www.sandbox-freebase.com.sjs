
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//122c.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//95b.account" + tags_codebase,
        "appeditor": "//96b.appeditor" + tags_codebase,
        "apps": "//97b.apps" + tags_codebase,
        "create": "//92b.create" + tags_codebase,
        "data": "//93b.data" + tags_codebase,
        "formbuilder": "//39b.formbuilder" + tags_codebase,
        "i18n": "//39a.i18n" + tags_codebase,
        "mdo": "//73a.mdo" + tags_codebase,
        "policies": "//95a.policies" + tags_codebase,
        "query": "//92a.query" + tags_codebase,
        "review": "//74a.review" + tags_codebase,
        "sample": "//94a.sample" + tags_codebase,
        "schema": "//100a.schema" + tags_codebase,
        "search": "//23a.search" + tags_codebase,
        "topic": "//98a.topic" + tags_codebase,
        "triples": "//94a.triples" + tags_codebase,
        "users": "//72a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

