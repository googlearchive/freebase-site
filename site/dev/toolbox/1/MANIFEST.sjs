
var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "promise" : "//1.promise.site.freebase.dev",
    "template": "//1.template.site.freebase.dev",
    "appeditor" : "//appeditor.apps.freebase.dev"
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/a4a9743023df04a089b0a33831bc6a73", "static_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/a4a9743023df04a089b0a33831bc6a73"});
