var MF = {

  version: {
    "/freebase/site/core": null
  },

  stylesheet: {
    "sample_page.css": ["/freebase/site/core/core.less", "sample_page.css", "sample_page.less"]
  },

  javascript: {
    "sample_page.js": ["/freebase/site/core/MANIFEST/core.js", "sample_page.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
