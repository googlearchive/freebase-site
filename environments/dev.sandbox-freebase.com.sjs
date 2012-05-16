
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//59a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//29a.site" + tags_codebase,
        "account": "//32a.account" + tags_codebase,
        "appeditor": "//33a.appeditor" + tags_codebase,
        "apps": "//33a.apps" + tags_codebase,
        "create": "//29a.create" + tags_codebase,
        "data": "//30a.data" + tags_codebase,
        "mdo": "//11a.mdo" + tags_codebase,
        "policies": "//33a.policies" + tags_codebase,
        "query": "//30a.query" + tags_codebase,
        "review": "//11a.review" + tags_codebase,
        "sameas": "//31a.sameas" + tags_codebase,
        "sample": "//32a.sample" + tags_codebase,
        "schema": "//36a.schema" + tags_codebase,
        "topic": "//36a.topic" + tags_codebase,
        "triples": "//32a.triples" + tags_codebase,
        "users": "//10a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

