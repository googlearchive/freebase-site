
var MF = {
  "apps" : {
    "core" : "//core.site.freebase.dev",
    "promise" : "//promise.site.freebase.dev",
    "appeditor" : "//release.appeditor.apps.freebase.dev"
  }
};

// acre.require(MF.apps.core).init(MF, this);
// temporary hack until acre.require supports new syntax
acre.require("/freebase/site/core/MANIFEST").init(MF, this);
