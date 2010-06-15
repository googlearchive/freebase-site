
var MF = {
  "version": {
    "/freebase/site/core": null,
    "/freebase/site/template": null,
    "/freebase/site/promise": null
  },
  
  "stylesheet": {
    "index.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css"]
  },

  "javascript": {
    "index.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js"]
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
