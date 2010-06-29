var MF = {
  "apps" : {
    "core" : "//core.site.freebase.dev",
    "promise" : "//promise.site.freebase.dev",
    "toolbox" : "//toolbox.site.freebase.dev",
    "jqueryui": "//jqueryui.site.freebase.dev"
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

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
