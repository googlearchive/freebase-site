
var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/promise": null
  },
  
  stylesheet: {
    "project.css": ["/freebase/site/core/MANIFEST/core.css"]
  },

  javascript: {
    "project.js": ["/freebase/site/core/MANIFEST/core.js"]
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
