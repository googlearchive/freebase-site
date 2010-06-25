
var MF = {
  "apps" : {
    "core" : "//core.site.freebase.dev",
    "promise" : "//promise.site.freebase.dev",
    "template": "//template.site.freebase.dev",
    "appeditor" : "//appeditor.apps.freebase.dev"
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
