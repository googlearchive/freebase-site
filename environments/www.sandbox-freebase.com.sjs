
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//108a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//81a.account" + tags_codebase,
        "appeditor": "//82a.appeditor" + tags_codebase,
        "apps": "//83a.apps" + tags_codebase,
        "create": "//78a.create" + tags_codebase,
        "data": "//79a.data" + tags_codebase,
        "formbuilder": "//25a.formbuilder" + tags_codebase,
        "i18n": "//25a.i18n" + tags_codebase,
        "mdo": "//59a.mdo" + tags_codebase,
        "policies": "//81a.policies" + tags_codebase,
        "query": "//78a.query" + tags_codebase,
        "review": "//60a.review" + tags_codebase,
        "sample": "//80a.sample" + tags_codebase,
        "schema": "//86a.schema" + tags_codebase,
        "search": "//9a.search" + tags_codebase,
        "topic": "//84a.topic" + tags_codebase,
        "triples": "//80a.triples" + tags_codebase,
        "users": "//58a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

