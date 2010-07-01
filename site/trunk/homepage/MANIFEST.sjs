
var MF = {
  "apps": {
      "core": "//5.core.site.freebase.dev",
      "template": "//6.template.site.freebase.dev",
      "promise": "//3.promise.site.freebase.dev",
      "libraries": "//2.libraries.apps.freebase.dev",
      "raphael": "//raphael.site.freebase.dev"
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
      ["raphael", "raphael.js"],
      ["raphael", "g.raphael.js"],
      ["raphael", "g.line.js"],
      ["raphael", "g.bar.js"],
      "jquery.tools.tabs.min.js",
      "homepage.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
