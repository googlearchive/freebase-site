
var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "promise" : "//1.promise.site.freebase.dev",
    "template": "//1.template.site.freebase.dev",
    "appeditor" : "//appeditor.apps.freebase.dev"
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
