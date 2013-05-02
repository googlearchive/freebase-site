
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//130a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//103b.account" + tags_codebase,
        "appeditor": "//104a.appeditor" + tags_codebase,
        "apps": "//105a.apps" + tags_codebase,
        "create": "//100a.create" + tags_codebase,
        "data": "//101a.data" + tags_codebase,
        "formbuilder": "//47a.formbuilder" + tags_codebase,
        "i18n": "//47a.i18n" + tags_codebase,
        "mdo": "//81a.mdo" + tags_codebase,
        "policies": "//103a.policies" + tags_codebase,
        "query": "//100a.query" + tags_codebase,
        "review": "//82a.review" + tags_codebase,
        "sample": "//102a.sample" + tags_codebase,
        "schema": "//108a.schema" + tags_codebase,
        "search": "//31a.search" + tags_codebase,
        "topic": "//106a.topic" + tags_codebase,
        "triples": "//102a.triples" + tags_codebase,
        "users": "//80a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

