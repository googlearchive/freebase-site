
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//110b.account" + tags_codebase,
        "appeditor": "//111b.appeditor" + tags_codebase,
        "apps": "//112b.apps" + tags_codebase,
        "create": "//107b.create" + tags_codebase,
        "data": "//108b.data" + tags_codebase,
        "formbuilder": "//53b.formbuilder" + tags_codebase,
        "i18n": "//54b.i18n" + tags_codebase,
        "mdo": "//88b.mdo" + tags_codebase,
        "policies": "//110b.policies" + tags_codebase,
        "query": "//107b.query" + tags_codebase,
        "review": "//89b.review" + tags_codebase,
        "sample": "//109b.sample" + tags_codebase,
        "schema": "//115b.schema" + tags_codebase,
        "search": "//38b.search" + tags_codebase,
        "topic": "//113b.topic" + tags_codebase,
        "triples": "//109b.triples" + tags_codebase,
        "users": "//87b.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

