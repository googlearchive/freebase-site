var MF = {
  "apps" : {
    "core" : "//core.site.freebase.dev",
    "template" : "//template.site.freebase.dev",
    "libraries" : "//release.libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "domain.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "project.less"
    ]
  },
  "javascript": {
    "domain.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      "jquery.lazyload.js", "jquery.masonry.js", "jquery.tablesorter.js",
      "project.js"
    ]
  }
};

// acre.require(MF.apps.core).init(MF, this);
// temporary hack until acre.require supports new syntax
acre.require("/freebase/site/core/MANIFEST").init(MF, this);
