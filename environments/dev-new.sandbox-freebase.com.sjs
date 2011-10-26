

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//36a.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//17a.site" + tags_codebase,
	"account": "//20a.account" + tags_codebase,
	"activity": "//18a.activity" + tags_codebase,
	"admin": "//17a.admin" + tags_codebase,
	"appeditor": "//21a.appeditor" + tags_codebase,
	"apps": "//21a.apps" + tags_codebase,
	"create": "//17a.create" + tags_codebase,
	"data": "//18a.data" + tags_codebase,
	"devdocs": "//20a.devdocs" + tags_codebase,
	"group": "//19a.group" + tags_codebase,
	"history": "//12a.history" + tags_codebase,
	"homepage": "//23a.homepage" + tags_codebase,
	"policies": "//21a.policies" + tags_codebase,
	"query": "//18a.query" + tags_codebase,
	"sameas": "//19a.sameas" + tags_codebase,
	"sample": "//20a.sample" + tags_codebase,
	"schema": "//24a.schema" + tags_codebase,
	"topic": "//24a.topic" + tags_codebase,
	"triples": "//20a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

