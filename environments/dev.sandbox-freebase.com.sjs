
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//65a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//35a.site" + tags_codebase,
        "account": "//38a.account" + tags_codebase,
        "appeditor": "//39a.appeditor" + tags_codebase,
        "apps": "//39a.apps" + tags_codebase,
        "create": "//35a.create" + tags_codebase,
        "data": "//36a.data" + tags_codebase,
        "mdo": "//17a.mdo" + tags_codebase,
        "policies": "//39a.policies" + tags_codebase,
        "query": "//36a.query" + tags_codebase,
        "review": "//18a.review" + tags_codebase,
        "sameas": "//37a.sameas" + tags_codebase,
        "sample": "//38a.sample" + tags_codebase,
        "schema": "//42a.schema" + tags_codebase,
        "topic": "//42a.topic" + tags_codebase,
        "triples": "//38a.triples" + tags_codebase,
        "users": "//16a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

