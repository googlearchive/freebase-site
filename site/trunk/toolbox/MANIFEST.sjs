
var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "promise" : "//1.promise.site.freebase.dev",
    "template": "//1.template.site.freebase.dev",
    "appeditor" : "//appeditor.apps.freebase.dev"
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
