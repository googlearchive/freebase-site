

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//46a.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//19a.site" + tags_codebase,
	"account": "//23a.account" + tags_codebase,
	"appeditor": "//24a.appeditor" + tags_codebase,
	"apps": "//24a.apps" + tags_codebase,
	"create": "//20a.create" + tags_codebase,
	"data": "//21a.data" + tags_codebase,
	"mdo": "//2a.mdo" + tags_codebase,
	"policies": "//24a.policies" + tags_codebase,
	"query": "//21a.query" + tags_codebase,
	"review": "//2a.review" + tags_codebase,
	"sameas": "//22a.sameas" + tags_codebase,
	"sample": "//23a.sample" + tags_codebase,
	"schema": "//27a.schema" + tags_codebase,
	"topic": "//27a.topic" + tags_codebase,
	"triples": "//23a.triples" + tags_codebase,
	"users": "//2a.users" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

