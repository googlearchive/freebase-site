
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//142a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//115a.account" + tags_codebase,
        "appeditor": "//116a.appeditor" + tags_codebase,
        "apps": "//117a.apps" + tags_codebase,
        "create": "//112a.create" + tags_codebase,
        "data": "//113a.data" + tags_codebase,
        "formbuilder": "//58a.formbuilder" + tags_codebase,
        "i18n": "//59a.i18n" + tags_codebase,
        "mdo": "//93a.mdo" + tags_codebase,
        "policies": "//115a.policies" + tags_codebase,
        "query": "//112a.query" + tags_codebase,
        "review": "//94a.review" + tags_codebase,
        "sample": "//114a.sample" + tags_codebase,
        "schema": "//120a.schema" + tags_codebase,
        "search": "//43a.search" + tags_codebase,
        "topic": "//118a.topic" + tags_codebase,
        "triples": "//114a.triples" + tags_codebase,
        "users": "//92a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

