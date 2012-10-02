
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//86a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//59a.account" + tags_codebase,
        "appeditor": "//60a.appeditor" + tags_codebase,
        "apps": "//61a.apps" + tags_codebase,
        "create": "//56a.create" + tags_codebase,
        "data": "//57a.data" + tags_codebase,
        "formbuilder": "//4a.formbuilder" + tags_codebase,
        "i18n": "//4a.i18n" + tags_codebase,
        "mdo": "//38a.mdo" + tags_codebase,
        "policies": "//60a.policies" + tags_codebase,
        "query": "//57a.query" + tags_codebase,
        "review": "//39a.review" + tags_codebase,
        "sameas": "//58a.sameas" + tags_codebase,
        "sample": "//59a.sample" + tags_codebase,
        "schema": "//65a.schema" + tags_codebase,
        "topic": "//63a.topic" + tags_codebase,
        "triples": "//59a.triples" + tags_codebase,
        "users": "//37a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

