
var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "template" : "//1.template.site.freebase.dev",
    "libraries" : "//release.libraries.apps.freebase.dev",
    "schemaviz" : "//release.schemaviz.pak21.user.dev"
  },
  "stylesheet": {
    "schema.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "schema.css"
    ]
  },
  "javascript": {
    "schema.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      "schema.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
