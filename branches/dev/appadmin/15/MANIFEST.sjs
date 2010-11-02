var MF = {
  "apps" : {
    "core": "//15.core.site.freebase.dev",
    "template": "//15.template.site.freebase.dev",
      "promise": "//14.promise.site.freebase.dev",
      "ae" : "//appeditor.apps.freebase.dev"
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/626145d2d187c1895b9d9964bfd5534f", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/626145d2d187c1895b9d9964bfd5534f"});
