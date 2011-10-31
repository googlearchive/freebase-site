

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//37a.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//18a.site" + tags_codebase,
	"account": "//21a.account" + tags_codebase,
	"activity": "//19a.activity" + tags_codebase,
	"admin": "//18a.admin" + tags_codebase,
	"appeditor": "//22a.appeditor" + tags_codebase,
	"apps": "//22a.apps" + tags_codebase,
	"create": "//18a.create" + tags_codebase,
	"data": "//19a.data" + tags_codebase,
	"devdocs": "//21a.devdocs" + tags_codebase,
	"group": "//20a.group" + tags_codebase,
	"history": "//13a.history" + tags_codebase,
	"homepage": "//24a.homepage" + tags_codebase,
	"policies": "//22a.policies" + tags_codebase,
	"query": "//19a.query" + tags_codebase,
	"sameas": "//20a.sameas" + tags_codebase,
	"sample": "//21a.sample" + tags_codebase,
	"schema": "//25a.schema" + tags_codebase,
	"topic": "//25a.topic" + tags_codebase,
	"triples": "//21a.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

