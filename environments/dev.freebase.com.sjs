

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//45a.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//18c.site" + tags_codebase,
	"account": "//22a.account" + tags_codebase,
	"appeditor": "//23a.appeditor" + tags_codebase,
	"apps": "//23a.apps" + tags_codebase,
	"create": "//19a.create" + tags_codebase,
	"data": "//20a.data" + tags_codebase,
	"mdo": "//1a.mdo" + tags_codebase,
	"policies": "//23a.policies" + tags_codebase,
	"query": "//20a.query" + tags_codebase,
	"review": "//1a.review" + tags_codebase,
	"sameas": "//21a.sameas" + tags_codebase,
	"sample": "//22a.sample" + tags_codebase,
	"schema": "//26a.schema" + tags_codebase,
	"topic": "//26a.topic" + tags_codebase,
	"triples": "//22a.triples" + tags_codebase,
	"users": "//1a.users" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

