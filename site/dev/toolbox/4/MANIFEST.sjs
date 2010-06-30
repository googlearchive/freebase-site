
var MF = {
  "apps" : {
    "core" : "//5.core.site.freebase.dev",
    "promise" : "//3.promise.site.freebase.dev",
    "template": "//6.template.site.freebase.dev",
    "appeditor" : "//release.appeditor.apps.freebase.dev"
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/$Rev$"});
