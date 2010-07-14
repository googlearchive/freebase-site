
var MF = {
  "apps": {
    "core": "//4.core.site.freebase.dev",
    "template": "//4.template.site.freebase.dev"
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/30b99f3a756478ec6479a1c4ee4d5436", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/30b99f3a756478ec6479a1c4ee4d5436"});
