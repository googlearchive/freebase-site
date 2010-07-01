var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "template" : "//1.template.site.freebase.dev",
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

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/domain/9dc66e2a1339270993b245bc1dcf4cf0", "static_base_url": "http://freebaselibs.com/static/freebase_site/domain/9dc66e2a1339270993b245bc1dcf4cf0"});
