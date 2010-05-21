
var MF = {

  version: {
    "/freebase/site/core": null
  },

  stylesheet: {
    "sample_page.css": ["sample_page.css", "sample_page.less"]
  },

  javascript: {
    "sample_page.js": ["sample_page.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
