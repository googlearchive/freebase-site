// site repository trunk and tags paths.
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = {

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "default": "//default.dev",
        "lib":     "//lib" + codebase
    },

    // Override prefix
    "prefix" : [
        // provides a backdoor for creating new keys with curl
        {prefix:"/keystore",   app:"default",  script: "keystore.sjs"},

        // sample app
        {prefix:"/sample",     app:"sample"}
    ],

    // overridde router list for devel so we can add the 'test' router
    "routers" : [
        "host",
        "custom",
        "test",
        "static",
        "ajax",
        "prefix",
        "object",
    ]
};

acre.require(environment_rules.labels.lib + "/routing/router.sjs").route(environment_rules, this);
