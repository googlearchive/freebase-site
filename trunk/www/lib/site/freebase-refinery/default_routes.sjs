// Default codebase for lib (this is the freebase-site SVN repository).
var lib_codebase = ".www.trunk.svn.freebase-site.googlecode.dev";

// Default codebase for this site - should map to trunk of SVN repository.
var site_codebase = ".trunk.svn.freebase-refinery.googlecode.dev";

// Rules will be stored here.
var rules = {};


function init_default_routes(lib) {

    // Trunk labels for all apps in this site. 
    // If you add a new app, you have to add it here first.

    rules["labels"] = {
        "lib":        "//lib" + lib_codebase,
        "sample":     "//sample" + site_codebase,
        "refinery":   "//refinery" + site_codebase
    };

    // Defaults to trunk lib if not specified.
    if (!lib) { 
        lib = rules["labels"]["lib"];
    }

    var h = acre.require(lib + "/helper/helpers.sjs");

    // *********** PREFIX *************
    
    rules["prefix"] = [ 
        
        {prefix:"/",         app:"refinery"},
        {prefix:"/sample",   app:"sample"},

        // Urls for exposed ajax libraries and static resources
        // These should be one level up as they are shared across sites.
        {prefix:"/static",             app:"lib", script:"routing/static.sjs"},
        {prefix:"/ajax",               app:"lib", script:"routing/ajax.sjs"},
        
    ];
    

    // *********** OBJECT *************

    rules["object"] =  []

    // *********** HOST *************

    rules["host"] = [];

    // *********** ROUTERS **********

    rules["routers"] = ["host", "prefix"];
        
    return rules;
    
}