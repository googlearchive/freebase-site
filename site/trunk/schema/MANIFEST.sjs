var MF = {
  "apps": {
      "core": "//core.site.freebase.dev",
      "template": "//template.site.freebase.dev",
      "promise": "//promise.site.freebase.dev",
      "jquerytools": "//jquerytools.site.freebase.dev",
      "libraries": "//libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "schema.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "schema.less"
    ]
  },
  "javascript": {
    "schema.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      ["jquerytools", "tabs.js"],
      "schema.js"
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);