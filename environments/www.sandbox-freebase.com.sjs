
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//123a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//96a.account" + tags_codebase,
        "appeditor": "//97a.appeditor" + tags_codebase,
        "apps": "//98a.apps" + tags_codebase,
        "create": "//93a.create" + tags_codebase,
        "data": "//94a.data" + tags_codebase,
        "formbuilder": "//40a.formbuilder" + tags_codebase,
        "i18n": "//40a.i18n" + tags_codebase,
        "mdo": "//74a.mdo" + tags_codebase,
        "policies": "//96a.policies" + tags_codebase,
        "query": "//93a.query" + tags_codebase,
        "review": "//75a.review" + tags_codebase,
        "sample": "//95a.sample" + tags_codebase,
        "schema": "//101a.schema" + tags_codebase,
        "search": "//24a.search" + tags_codebase,
        "topic": "//99a.topic" + tags_codebase,
        "triples": "//95a.triples" + tags_codebase,
        "users": "//73a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

