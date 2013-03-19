
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//121a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//94a.account" + tags_codebase,
        "appeditor": "//95a.appeditor" + tags_codebase,
        "apps": "//96a.apps" + tags_codebase,
        "create": "//91a.create" + tags_codebase,
        "data": "//92a.data" + tags_codebase,
        "formbuilder": "//38a.formbuilder" + tags_codebase,
        "i18n": "//38a.i18n" + tags_codebase,
        "mdo": "//72a.mdo" + tags_codebase,
        "policies": "//94a.policies" + tags_codebase,
        "query": "//91a.query" + tags_codebase,
        "review": "//73a.review" + tags_codebase,
        "sample": "//93a.sample" + tags_codebase,
        "schema": "//99a.schema" + tags_codebase,
        "search": "//22a.search" + tags_codebase,
        "topic": "//97a.topic" + tags_codebase,
        "triples": "//93a.triples" + tags_codebase,
        "users": "//71a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

