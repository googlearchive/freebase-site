
var MF = {

  version: {
    "/freebase/site/core" : null,
    "/freebase/site/template": null,
    "/freebase/apps/libraries" : "release",
    "/user/pak21/schemaviz" : null
  },

  stylesheet: {
    "schema.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "schema.css"]
  },

  javascript: {
    "schema.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", "schema.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
