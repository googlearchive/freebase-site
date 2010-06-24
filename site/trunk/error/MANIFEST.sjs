
var MF = {
  "apps": {
    "core": "//core.site.freebase.dev",
    "template": "//template.site.freebase.dev"
  },
  stylesheet: {
    "error.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"]
    ]
  },
  javascript: {
    "error.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"]
    ]
  }
};

// acre.require(MF.apps.core).init(MF, this);
// temporary until acre.require supports new syntax
acre.require("/freebase/site/core/MANIFEST").init(MF, this);
