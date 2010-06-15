var MF = {

  version: {
    "/freebase/site/core": "release"
  },

  stylesheet: {
    "appadmin.css": ["/freebase/site/core/MANIFEST/core.css", "appadmin_core.css"]
  },

  javascript: {
    "appadmin.js": ["/freebase/site/core/MANIFEST/core.js", "appadmin_core.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);