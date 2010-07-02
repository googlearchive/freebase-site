var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "template" : "//1.template.site.freebase.dev",
    "promise" : "//1.promise.site.freebase.dev"
  },
  "stylesheet": {
    "appadmin.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "appadmin_core.css"
    ]
  },
  "javascript": {
    "appadmin.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      "appadmin_core.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
