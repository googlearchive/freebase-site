
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//129a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//102a.account" + tags_codebase,
        "appeditor": "//103a.appeditor" + tags_codebase,
        "apps": "//104a.apps" + tags_codebase,
        "create": "//99a.create" + tags_codebase,
        "data": "//100a.data" + tags_codebase,
        "formbuilder": "//46a.formbuilder" + tags_codebase,
        "i18n": "//46a.i18n" + tags_codebase,
        "mdo": "//80a.mdo" + tags_codebase,
        "policies": "//102a.policies" + tags_codebase,
        "query": "//99a.query" + tags_codebase,
        "review": "//81a.review" + tags_codebase,
        "sample": "//101a.sample" + tags_codebase,
        "schema": "//107a.schema" + tags_codebase,
        "search": "//30a.search" + tags_codebase,
        "topic": "//105a.topic" + tags_codebase,
        "triples": "//101a.triples" + tags_codebase,
        "users": "//79a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

