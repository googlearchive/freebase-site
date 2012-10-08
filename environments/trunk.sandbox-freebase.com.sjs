
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";

var environment_rules = {

    "labels" : {
        "lib": "//lib.www.trunk.svn.freebase-site.googlecode.dev",
        "default" : "//default.dev",
        "account": "//account" + codebase,
        "appeditor": "//appeditor" + codebase,
        "apps": "//apps" + codebase,
        "create": "//create" + codebase,
        "data": "//data" + codebase,
        "formbuilder": "//formbuilder" + codebase,
        "i18n": "//4a.i18n" + tags_codebase,
        "mdo": "//mdo" + codebase,
        "policies": "//policies" + codebase,
        "query": "//query" + codebase,
        "review": "//review" + codebase,
        "sameas": "//sameas" + codebase,
        "sample": "//sample" + codebase,
        "schema": "//schema" + codebase,
        "topic": "//topic" + codebase,
        "triples": "//triples" + codebase,
        "users": "//users" + codebase

    },

    "prefix" : []

};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);

