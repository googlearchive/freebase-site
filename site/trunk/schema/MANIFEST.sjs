
var MF = {

  version: {
    "/freebase/site/core" : null,
    "/freebase/apps/libraries" : "release",
    "/user/pak21/schemaviz" : null
  },

  stylesheet: {
    "schema.css": ["/freebase/site/core/MANIFEST/core.css", "schema.css"]
  },

  javascript: {
    "index.js": ["/freebase/site/core/MANIFEST/core.js", "index.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
