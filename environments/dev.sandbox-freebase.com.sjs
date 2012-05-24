
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//60a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//30a.site" + tags_codebase,
        "account": "//33a.account" + tags_codebase,
        "appeditor": "//34a.appeditor" + tags_codebase,
        "apps": "//34a.apps" + tags_codebase,
        "create": "//30a.create" + tags_codebase,
        "data": "//31a.data" + tags_codebase,
        "mdo": "//12a.mdo" + tags_codebase,
        "policies": "//34a.policies" + tags_codebase,
        "query": "//31a.query" + tags_codebase,
        "review": "//12a.review" + tags_codebase,
        "sameas": "//32a.sameas" + tags_codebase,
        "sample": "//33a.sample" + tags_codebase,
        "schema": "//37a.schema" + tags_codebase,
        "topic": "//37a.topic" + tags_codebase,
        "triples": "//33a.triples" + tags_codebase,
        "users": "//11a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);


// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//61a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "site": "//31a.site" + tags_codebase,
        "account": "//34a.account" + tags_codebase,
        "appeditor": "//35a.appeditor" + tags_codebase,
        "apps": "//35a.apps" + tags_codebase,
        "create": "//31a.create" + tags_codebase,
        "data": "//32a.data" + tags_codebase,
        "mdo": "//13a.mdo" + tags_codebase,
        "policies": "//35a.policies" + tags_codebase,
        "query": "//32a.query" + tags_codebase,
        "review": "//13a.review" + tags_codebase,
        "sameas": "//33a.sameas" + tags_codebase,
        "sample": "//34a.sample" + tags_codebase,
        "schema": "//38a.schema" + tags_codebase,
        "topic": "//38a.topic" + tags_codebase,
        "triples": "//34a.triples" + tags_codebase,
        "users": "//12a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules);

