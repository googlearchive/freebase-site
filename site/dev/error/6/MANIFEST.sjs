
var MF = {
  "apps": {
    "core": "//6.core.site.freebase.dev",
    "template": "//6.template.site.freebase.dev"
  },
  stylesheet: {
    "error.mf.css": [
      ["template", "freebase.mf.css"]
    ]
  },
  javascript: {
    "error.mf.js": [
      ["template", "freebase.mf.js"]
    ]
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/4d25a2b4ee3b791defad2427f0ea5885", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/4d25a2b4ee3b791defad2427f0ea5885"});
