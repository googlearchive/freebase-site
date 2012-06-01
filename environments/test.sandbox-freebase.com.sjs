
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//lib.www.trunk.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//site" + codebase,
        "account": "//account" + codebase,
        "appeditor": "//appeditor" + codebase,
        "apps": "//apps" + codebase,
        "create": "//create" + codebase,
        "data": "//data" + codebase,
        "mdo": "//mdo" + codebase,
        "policies": "//policies" + codebase,
        "query": "//query" + codebase,
        "review": "//review" + codebase,
        "sameas": "//sameas" + codebase,
        "sample": "//sample" + codebase,
        "schema": "//schema" + codebase,
        "topic": "//topic" + codebase,
        "triples": "//triples" + codebase,
        "users": "//users" + codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

