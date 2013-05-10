
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//131a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//104a.account" + tags_codebase,
        "appeditor": "//105a.appeditor" + tags_codebase,
        "apps": "//106a.apps" + tags_codebase,
        "create": "//101a.create" + tags_codebase,
        "data": "//102a.data" + tags_codebase,
        "formbuilder": "//47b.formbuilder" + tags_codebase,
        "i18n": "//48a.i18n" + tags_codebase,
        "mdo": "//82a.mdo" + tags_codebase,
        "policies": "//104a.policies" + tags_codebase,
        "query": "//101a.query" + tags_codebase,
        "review": "//83a.review" + tags_codebase,
        "sample": "//103a.sample" + tags_codebase,
        "schema": "//109a.schema" + tags_codebase,
        "search": "//32a.search" + tags_codebase,
        "topic": "//107a.topic" + tags_codebase,
        "triples": "//103a.triples" + tags_codebase,
        "users": "//81a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

