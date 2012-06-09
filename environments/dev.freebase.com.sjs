
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//64a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//34a.site" + tags_codebase,
        "account": "//37a.account" + tags_codebase,
        "appeditor": "//38a.appeditor" + tags_codebase,
        "apps": "//38a.apps" + tags_codebase,
        "create": "//34a.create" + tags_codebase,
        "data": "//35a.data" + tags_codebase,
        "mdo": "//16a.mdo" + tags_codebase,
        "policies": "//38a.policies" + tags_codebase,
        "query": "//35a.query" + tags_codebase,
        "review": "//16a.review" + tags_codebase,
        "sameas": "//36a.sameas" + tags_codebase,
        "sample": "//37a.sample" + tags_codebase,
        "schema": "//41a.schema" + tags_codebase,
        "topic": "//41a.topic" + tags_codebase,
        "triples": "//37a.triples" + tags_codebase,
        "users": "//15a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

