var MF = {
  "apps" : {
    "core": "//13.core.site.freebase.dev",
    "promise": "//13.promise.site.freebase.dev",
    "toolbox": "//13.toolbox.site.freebase.dev",
    "permission": "//13.permission.site.freebase.dev",
    "jqueryui": "//13.jqueryui.site.freebase.dev"
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
      "jquery.placeholder.js",
      "jquery.metadata.js",
      ["jqueryui", "jquery.ui.core.mf.js"],
      "freebase.js"/*,
      ["toolbox", "toolbox.js"]*/
    ],
    "freebase-permission.mf.js": [
      "freebase.mf.js",
      ["permission", "permission.js"]
    ]
  },
  "stylesheet": {
    "freebase.mf.css": [
      "freebase.less",
      "components.less"/*,
      ["toolbox", "toolbox.less"]*/
    ]
  }
};
MF.suggest.base_url += MF.suggest.version;
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/735c3ee20f362c6f72436019a00e5afb", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/735c3ee20f362c6f72436019a00e5afb"});
