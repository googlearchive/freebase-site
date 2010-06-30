var MF = {
  "apps" : {
    "core" : "//5.core.site.freebase.dev",
    "template" : "//6.template.site.freebase.dev",
    "promise" : "//3.promise.site.freebase.dev"
  },
  "test" : {
    "files" : ["test_new_ids"]
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
