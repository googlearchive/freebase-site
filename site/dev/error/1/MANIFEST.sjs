

var MF = {
  version: {
    "/freebase/site/core": null
  },
  stylesheet: {
    "error.css": ["/freebase/site/core/MANIFEST/core.css"]
  },
  javascript: {
    "error.js": ["/freebase/site/core/MANIFEST/core.js"]
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
