var MF = {
  "apps" : {
    "core": "//5.core.site.freebase.dev",
    "template": "//5.template.site.freebase.dev",
    "promise": "//5.promise.site.freebase.dev",
    "jqueryui": "//5.jqueryui.site.freebase.dev"
  },
  "stylesheet": {
    "sample_page.mf.css": [
      ["template", "freebase.mf.css"],
      ["jqueryui", "jquery.ui.tabs.js"],
      "sample_page.css",
      "sample_page.less"
    ]
  },
  "javascript": {
    "sample_page.mf.js": [
      ["template", "freebase.mf.js"],
      "sample_page.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/sample/b47bf08f6b1b5264b49bf55b46d9d3af", "static_base_url": "http://freebaselibs.com/static/freebase_site/sample/b47bf08f6b1b5264b49bf55b46d9d3af"});
