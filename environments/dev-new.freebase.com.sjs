

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//47a.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//20a.site" + tags_codebase,
	"account": "//24a.account" + tags_codebase,
	"appeditor": "//25a.appeditor" + tags_codebase,
	"apps": "//25a.apps" + tags_codebase,
	"create": "//21a.create" + tags_codebase,
	"data": "//22a.data" + tags_codebase,
	"mdo": "//3a.mdo" + tags_codebase,
	"policies": "//25a.policies" + tags_codebase,
	"query": "//22a.query" + tags_codebase,
	"review": "//3a.review" + tags_codebase,
	"sameas": "//23a.sameas" + tags_codebase,
	"sample": "//24a.sample" + tags_codebase,
	"schema": "//28a.schema" + tags_codebase,
	"topic": "//28a.topic" + tags_codebase,
	"triples": "//24a.triples" + tags_codebase,
	"users": "//3a.users" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);
