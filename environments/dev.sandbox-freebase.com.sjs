
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//68a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//38a.site" + tags_codebase,
        "account": "//41a.account" + tags_codebase,
        "appeditor": "//42b.appeditor" + tags_codebase,
        "apps": "//42a.apps" + tags_codebase,
        "create": "//38a.create" + tags_codebase,
        "data": "//39a.data" + tags_codebase,
        "mdo": "//20a.mdo" + tags_codebase,
        "policies": "//42a.policies" + tags_codebase,
        "query": "//39a.query" + tags_codebase,
        "review": "//21a.review" + tags_codebase,
        "sameas": "//40a.sameas" + tags_codebase,
        "sample": "//41a.sample" + tags_codebase,
        "schema": "//45a.schema" + tags_codebase,
        "topic": "//45a.topic" + tags_codebase,
        "triples": "//41a.triples" + tags_codebase,
        "users": "//19a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

