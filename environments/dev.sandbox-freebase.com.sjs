

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//35b.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//16a.site" + tags_codebase,
	"account": "//19a.account" + tags_codebase,
	"activity": "//17a.activity" + tags_codebase,
	"admin": "//16a.admin" + tags_codebase,
	"appeditor": "//20a.appeditor" + tags_codebase,
	"apps": "//20a.apps" + tags_codebase,
	"create": "//16a.create" + tags_codebase,
	"data": "//17a.data" + tags_codebase,
	"devdocs": "//19a.devdocs" + tags_codebase,
	"group": "//18a.group" + tags_codebase,
	"history": "//11a.history" + tags_codebase,
	"homepage": "//22a.homepage" + tags_codebase,
	"policies": "//20a.policies" + tags_codebase,
	"query": "//17a.query" + tags_codebase,
	"sameas": "//18a.sameas" + tags_codebase,
	"sample": "//19a.sample" + tags_codebase,
	"schema": "//23a.schema" + tags_codebase,
	"topic": "//23a.topic" + tags_codebase,
	"triples": "//19a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

