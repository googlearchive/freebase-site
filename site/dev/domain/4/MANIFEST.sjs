var MF = {
  "apps" : {
    "core": "//4.core.site.freebase.dev",
    "template": "//4.template.site.freebase.dev",
    
    // external apps
    "libraries" : "//release.libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "domain.mf.css": [
      ["template", "freebase.mf.css"],
      "project.less"
    ]
  },
  "javascript": {
    "domain.mf.js": [
      ["template", "freebase.mf.js"],
      "jquery.lazyload.js", "jquery.masonry.js", "jquery.tablesorter.js",
      "project.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
