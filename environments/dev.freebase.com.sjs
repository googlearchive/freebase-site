
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//62a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//32a.site" + tags_codebase,
        "account": "//35a.account" + tags_codebase,
        "appeditor": "//36a.appeditor" + tags_codebase,
        "apps": "//36a.apps" + tags_codebase,
        "create": "//32a.create" + tags_codebase,
        "data": "//33a.data" + tags_codebase,
        "mdo": "//14a.mdo" + tags_codebase,
        "policies": "//36a.policies" + tags_codebase,
        "query": "//33a.query" + tags_codebase,
        "review": "//14a.review" + tags_codebase,
        "sameas": "//34a.sameas" + tags_codebase,
        "sample": "//35a.sample" + tags_codebase,
        "schema": "//39a.schema" + tags_codebase,
        "topic": "//39a.topic" + tags_codebase,
        "triples": "//35a.triples" + tags_codebase,
        "users": "//13a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

