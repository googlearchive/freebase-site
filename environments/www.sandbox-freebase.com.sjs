
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//109a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//82a.account" + tags_codebase,
        "appeditor": "//83a.appeditor" + tags_codebase,
        "apps": "//84a.apps" + tags_codebase,
        "create": "//79a.create" + tags_codebase,
        "data": "//80a.data" + tags_codebase,
        "formbuilder": "//26a.formbuilder" + tags_codebase,
        "i18n": "//26a.i18n" + tags_codebase,
        "mdo": "//60a.mdo" + tags_codebase,
        "policies": "//82a.policies" + tags_codebase,
        "query": "//79a.query" + tags_codebase,
        "review": "//61a.review" + tags_codebase,
        "sample": "//81a.sample" + tags_codebase,
        "schema": "//87a.schema" + tags_codebase,
        "search": "//10a.search" + tags_codebase,
        "topic": "//85a.topic" + tags_codebase,
        "triples": "//81a.triples" + tags_codebase,
        "users": "//59a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

