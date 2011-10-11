

// site repository trunk and tags paths. 
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var environment_rules = { 

    // Override labels. All labels point to trunk by default.
    "labels" : {
        "lib": "//30f.lib.www.tags.svn.freebase-site.googlecode.dev",

	"site": "//12b.site" + tags_codebase,
	"account": "//16b.account" + tags_codebase,
	"activity": "//14b.activity" + tags_codebase,
	"admin": "//13b.admin" + tags_codebase,
	"appeditor": "//17b.appeditor" + tags_codebase,
	"apps": "//17b.apps" + tags_codebase,
	"create": "//13b.create" + tags_codebase,
	"data": "//14b.data" + tags_codebase,
	"devdocs": "//16b.devdocs" + tags_codebase,
	"group": "//15b.group" + tags_codebase,
	"history": "//8b.history" + tags_codebase,
	"homepage": "//19b.homepage" + tags_codebase,
	"policies": "//17b.policies" + tags_codebase,
	"query": "//14b.query" + tags_codebase,
	"sameas": "//15b.sameas" + tags_codebase,
	"sample": "//14b.sample" + tags_codebase,
	"schema": "//20b.schema" + tags_codebase,
	"topic": "//20b.topic" + tags_codebase,
	"triples": "//16b.triples" + tags_codebase

    },
 
    // Override prefix.

    "prefix" : []
};

acre.require(environment_rules.labels.site + "/router.sjs").route(environment_rules, this);

