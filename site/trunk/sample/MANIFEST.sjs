var MF = {
  "apps" : {
    "core" : "//core.site.freebase.dev",
    "template" : "//template.site.freebase.dev",
    "promise" : "//promise.site.freebase.dev"
  },
  "stylesheet": {
    "sample_page.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "sample_page.css",
      "sample_page.less"
    ]
  },
  "javascript": {
    "sample_page.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      "sample_page.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
