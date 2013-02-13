
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//107a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//80a.account" + tags_codebase,
        "appeditor": "//81a.appeditor" + tags_codebase,
        "apps": "//82a.apps" + tags_codebase,
        "create": "//77a.create" + tags_codebase,
        "data": "//78a.data" + tags_codebase,
        "formbuilder": "//24a.formbuilder" + tags_codebase,
        "i18n": "//24a.i18n" + tags_codebase,
        "mdo": "//58a.mdo" + tags_codebase,
        "policies": "//80a.policies" + tags_codebase,
        "query": "//77a.query" + tags_codebase,
        "review": "//59a.review" + tags_codebase,
        "sample": "//79a.sample" + tags_codebase,
        "schema": "//85a.schema" + tags_codebase,
        "search": "//8a.search" + tags_codebase,
        "topic": "//83a.topic" + tags_codebase,
        "triples": "//79a.triples" + tags_codebase,
        "users": "//57a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

