
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//128b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//101b.account" + tags_codebase,
        "appeditor": "//102a.appeditor" + tags_codebase,
        "apps": "//103a.apps" + tags_codebase,
        "create": "//98a.create" + tags_codebase,
        "data": "//99a.data" + tags_codebase,
        "formbuilder": "//45a.formbuilder" + tags_codebase,
        "i18n": "//45a.i18n" + tags_codebase,
        "mdo": "//79a.mdo" + tags_codebase,
        "policies": "//101a.policies" + tags_codebase,
        "query": "//98a.query" + tags_codebase,
        "review": "//80a.review" + tags_codebase,
        "sample": "//100a.sample" + tags_codebase,
        "schema": "//106a.schema" + tags_codebase,
        "search": "//29a.search" + tags_codebase,
        "topic": "//104a.topic" + tags_codebase,
        "triples": "//100a.triples" + tags_codebase,
        "users": "//78a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

