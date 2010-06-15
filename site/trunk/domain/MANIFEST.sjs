var MF = {

  version: {
    "/freebase/site/core": null,
    "/freebase/site/template": null,
    "/freebase/apps/libraries": "release"
  },

  stylesheet: {
    "domain.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "project.less"]
  },

  javascript: {
    "domain.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", "project.js", 
                     "jquery.lazyload.js", "jquery.masonry.js", "jquery.tablesorter.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
