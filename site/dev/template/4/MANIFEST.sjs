var MF = {
  "apps" : {
    "core": "//4.core.site.freebase.dev",
    "promise": "//4.promise.site.freebase.dev",
    "toolbox": "//4.toolbox.site.freebase.dev",
    "jqueryui": "//4.jqueryui.site.freebase.dev"
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
      ["jqueryui", "jquery.ui.core.mf.js"],
      "freebase.js"/*,
      ["toolbox", "toolbox.js"]*/
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/09aa7624faca10e8ebb783e0f4c6dca6", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/09aa7624faca10e8ebb783e0f4c6dca6"});
