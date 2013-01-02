
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//72b.account" + tags_codebase,
        "appeditor": "//73b.appeditor" + tags_codebase,
        "apps": "//74b.apps" + tags_codebase,
        "create": "//69b.create" + tags_codebase,
        "data": "//70b.data" + tags_codebase,
        "formbuilder": "//16b.formbuilder" + tags_codebase,
        "i18n": "//16b.i18n" + tags_codebase,
        "mdo": "//50b.mdo" + tags_codebase,
        "policies": "//72b.policies" + tags_codebase,
        "query": "//69b.query" + tags_codebase,
        "review": "//51a.review" + tags_codebase,
        "sameas": "//70a.sameas" + tags_codebase,
        "sample": "//71a.sample" + tags_codebase,
        "schema": "//77a.schema" + tags_codebase,
        "topic": "//75a.topic" + tags_codebase,
        "triples": "//71a.triples" + tags_codebase,
        "users": "//49a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

