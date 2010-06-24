
var MF = {
  "apps" : {
      "core" : "//core.site.freebase.dev",
      "template" : "//template.site.freebase.dev",
      "libraries" : "//libraries.apps.freebase.dev",
      "promise" : "//promise.site.freebase.dev"
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

// acre.require(MF.apps.core).init(MF, this);
// temporary hack until acre.require supports new syntax
acre.require("/freebase/site/core/MANIFEST").init(MF, this);
