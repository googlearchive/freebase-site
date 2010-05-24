var MF = {

  version: {
    "/freebase/site/core": null
  },

  stylesheet: {
    "project.css": ["/freebase/site/core/core.less", "project.css"]
  },

  javascript: {
    "project.js": ["project.js", "jquery.lazyload.js", "jquery.masonry.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);