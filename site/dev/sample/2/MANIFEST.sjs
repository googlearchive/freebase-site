var MF = {

  version: {
    "/freebase/site/core": null,
    "/freebase/site/template": null,
    "/freebase/site/promise": null
  },

  stylesheet: {
    "sample_page.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "sample_page.css", "sample_page.less"]
  },

  javascript: {
    "sample_page.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", "sample_page.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
