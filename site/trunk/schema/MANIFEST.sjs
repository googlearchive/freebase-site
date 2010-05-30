
var MF = {

  version: {
    "/freebase/site/core" : null,
    "/freebase/apps/libraries" : "release",
    "/user/pak21/schemaviz" : null
  },
  
  stylesheet: {
    "schema.css": ["/freebase/site/core/core.less", "schema.css"]
  },

  javascript: {
    "index.js": ["/freebase/site/core/core.js", "index.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);