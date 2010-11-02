
var MF = {
  "apps": {
      "core": "//9.core.site.freebase.dev",
      "template": "//9.template.site.freebase.dev",
      "promise": "//9.promise.site.freebase.dev",
      "flot": "//9.flot.site.freebase.dev",
      
      "libraries": "//2.libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "homepage.mf.css": [
      ["template", "freebase.mf.css"],
      "homepage.less"
    ]
  },
  "javascript": {
    "homepage.mf.js": [
      ["template", "freebase.mf.js"],
      ["flot", "flot.core.mf.js"],
      "jquery.tools.tabs.min.js",
      "homepage.js"
    ]
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/3351bc187daf334d02135ff540f5907d", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/3351bc187daf334d02135ff540f5907d"});
