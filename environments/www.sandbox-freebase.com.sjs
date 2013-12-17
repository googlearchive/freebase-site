
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//145a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//118a.account" + tags_codebase,
        "appeditor": "//119a.appeditor" + tags_codebase,
        "apps": "//120a.apps" + tags_codebase,
        "create": "//115a.create" + tags_codebase,
        "data": "//116a.data" + tags_codebase,
        "formbuilder": "//61a.formbuilder" + tags_codebase,
        "i18n": "//62a.i18n" + tags_codebase,
        "mdo": "//96a.mdo" + tags_codebase,
        "policies": "//118a.policies" + tags_codebase,
        "query": "//115a.query" + tags_codebase,
        "review": "//97a.review" + tags_codebase,
        "sample": "//117a.sample" + tags_codebase,
        "schema": "//123a.schema" + tags_codebase,
        "search": "//46a.search" + tags_codebase,
        "topic": "//121a.topic" + tags_codebase,
        "triples": "//117a.triples" + tags_codebase,
        "users": "//95a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

