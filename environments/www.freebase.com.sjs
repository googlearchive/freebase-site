
// WARNING: This is an auto-generated file by //trunk/scripts/sitedeploy.py.
// If you make changes to this file, please adjust ActionCreateRoutes.__call__ in there too.

var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//126a.lib.www.tags.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",

        "account": "//99a.account" + tags_codebase,
        "appeditor": "//100a.appeditor" + tags_codebase,
        "apps": "//101a.apps" + tags_codebase,
        "create": "//96a.create" + tags_codebase,
        "data": "//97a.data" + tags_codebase,
        "formbuilder": "//43a.formbuilder" + tags_codebase,
        "i18n": "//43a.i18n" + tags_codebase,
        "mdo": "//77a.mdo" + tags_codebase,
        "policies": "//99a.policies" + tags_codebase,
        "query": "//96a.query" + tags_codebase,
        "review": "//78a.review" + tags_codebase,
        "sample": "//98a.sample" + tags_codebase,
        "schema": "//104a.schema" + tags_codebase,
        "search": "//27a.search" + tags_codebase,
        "topic": "//102a.topic" + tags_codebase,
        "triples": "//98a.triples" + tags_codebase,
        "users": "//76a.users" + tags_codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

