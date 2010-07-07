
var MF = {
  "apps": {
      "core": "//1.core.site.freebase.dev",
      "template": "//1.template.site.freebase.dev",
      "promise": "//1.promise.site.freebase.dev",
      "raphael": "//1.raphael.site.freebase.dev",

      "libraries": "//2.libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "index.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "homepage.less"
    ]
  },
  "javascript": {
    "index.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      ["raphael", "raphael.js"],
      ["raphael", "g.raphael.js"],
      ["raphael", "g.line.js"],
      ["raphael", "g.bar.js"],
      "jquery.tools.tabs.min.js",
      "homepage.js"
    ]
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
