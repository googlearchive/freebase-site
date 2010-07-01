var MF = {
  "apps" : {
    "core" : "//1.core.site.freebase.dev",
    "promise" : "//1.promise.site.freebase.dev",
    "toolbox" : "//1.toolbox.site.freebase.dev",
    "jqueryui": "//1.jqueryui.site.freebase.dev"
  },
  "suggest" : {
    "version": "1.2.1",
    "base_url": "http://freebaselibs.com/static/suggest/"
  },
  "jquery" : {
    "version" : "1.4"
  },
  "javascript": {
    "freebase.mf.js": [
      "jquery.cookie.js",
      ["jqueryui", "MANIFEST", "/jquery.ui.core.mf.js"],
      "freebase.js",
      ["toolbox", "toolbox.js"]
    ]
  },
  "stylesheet": {
    "freebase.mf.css": [
      "freebase.less",
      "components.less",
      ["toolbox", "toolbox.less"]
    ]
  }
};
MF.suggest.base_url += MF.suggest.version;

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/17e2b8015538c0251139be4a98a25136", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/17e2b8015538c0251139be4a98a25136"});
