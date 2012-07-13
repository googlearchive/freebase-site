
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//69a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//39a.site" + tags_codebase,
        "account": "//42a.account" + tags_codebase,
        "appeditor": "//43a.appeditor" + tags_codebase,
        "apps": "//43a.apps" + tags_codebase,
        "create": "//39a.create" + tags_codebase,
        "data": "//40a.data" + tags_codebase,
        "mdo": "//21a.mdo" + tags_codebase,
        "policies": "//43a.policies" + tags_codebase,
        "query": "//40a.query" + tags_codebase,
        "review": "//22a.review" + tags_codebase,
        "sameas": "//41a.sameas" + tags_codebase,
        "sample": "//42a.sample" + tags_codebase,
        "schema": "//46a.schema" + tags_codebase,
        "topic": "//46a.topic" + tags_codebase,
        "triples": "//42a.triples" + tags_codebase,
        "users": "//20a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

