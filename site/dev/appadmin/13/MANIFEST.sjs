var MF = {
  "apps" : {
    "core": "//13.core.site.freebase.dev",
    "template": "//13.template.site.freebase.dev",
      "promise": "//13.promise.site.freebase.dev",
      "ae" : "//release.appeditor.apps.freebase.dev"
  },
  "stylesheet": {
    "appadmin.mf.css": [
      ["template", "freebase.mf.css"],
      "appadmin_core.css"
    ]
  },
  "javascript": {
    "appadmin.mf.js": [
      ["template", "freebase.mf.js"],
      "appadmin_core.js"
    ]
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
