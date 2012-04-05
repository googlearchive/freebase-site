
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//58a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//28b.site" + tags_codebase,
        "account": "//31a.account" + tags_codebase,
        "appeditor": "//32a.appeditor" + tags_codebase,
        "apps": "//32a.apps" + tags_codebase,
        "create": "//28a.create" + tags_codebase,
        "data": "//29a.data" + tags_codebase,
        "mdo": "//10a.mdo" + tags_codebase,
        "policies": "//32a.policies" + tags_codebase,
        "query": "//29a.query" + tags_codebase,
        "review": "//10a.review" + tags_codebase,
        "sameas": "//30a.sameas" + tags_codebase,
        "sample": "//31a.sample" + tags_codebase,
        "schema": "//35a.schema" + tags_codebase,
        "topic": "//35a.topic" + tags_codebase,
        "triples": "//31a.triples" + tags_codebase,
        "users": "//9a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

