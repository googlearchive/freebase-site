
var mf = {
  "apps": {
    "core": "//core.site.freebase.dev"
  },
  stylesheet: {
    "error.mf.css": [
      ["template", "freebase.mf.css"]
    ]
  },
  javascript: {
    "error.mf.js": [
      ["template", "freebase.mf.js"]
    ]
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
