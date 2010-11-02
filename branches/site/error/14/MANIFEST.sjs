
var MF = {
  "apps": {
    "core": "//14.core.site.freebase.dev",
    "template": "//14.template.site.freebase.dev"
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/ba62f64a48cfebccdb4072d1c2cd3d9c", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/ba62f64a48cfebccdb4072d1c2cd3d9c"});
