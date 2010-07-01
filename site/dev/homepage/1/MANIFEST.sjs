
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

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ea7d6bc470d6c3a3421474257d9feb29", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ea7d6bc470d6c3a3421474257d9feb29"});
