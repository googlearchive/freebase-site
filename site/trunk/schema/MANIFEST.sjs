var MF = {
  "apps": {
      "core": "//core.site.freebase.dev",
      "template": "//template.site.freebase.dev",
      "promise": "//promise.site.freebase.dev",
      "jquerytools": "//jquerytools.site.freebase.dev",
      "libraries": "//libraries.apps.freebase.dev",
      "domain": "//domain.site.freebase.dev"
  },
  "stylesheet": {
    "schema.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css",],
      ["template", "freebase.table.less"],
      "schema.less"
    ]
  },
  "javascript": {
    "schema.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"],
      ["jquerytools", "tabs.js"],
      ["domain", "jquery.tablesorter.js"],
      "schema.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
