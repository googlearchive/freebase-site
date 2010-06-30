
var MF = {
  "apps" : {
      "core" : "//5.core.site.freebase.dev",
      "template" : "//6.template.site.freebase.dev",
      "promise" : "//3.promise.site.freebase.dev",
      "libraries" : "//2.libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "index.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "homepage.css"
    ]
  },
  "javascript": {
    "index.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      "jquery.tools.tabs.min.js",
      "jquery.equalizecols.js",
      "homepage.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/$Rev$"});
 