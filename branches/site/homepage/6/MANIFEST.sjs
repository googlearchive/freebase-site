
var MF = {
  "apps": {
      "core": "//6.core.site.freebase.dev",
      "template": "//6.template.site.freebase.dev",
      "promise": "//6.promise.site.freebase.dev",
      "flot": "//6.flot.site.freebase.dev",
      
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/25aef4017ea5cd5d27dae3e920695a01", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/25aef4017ea5cd5d27dae3e920695a01"});
