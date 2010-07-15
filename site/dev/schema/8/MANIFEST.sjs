var MF = {
  "apps": {
      "core": "//8.core.site.freebase.dev",
      "template": "//8.template.site.freebase.dev",
      "promise": "//8.promise.site.freebase.dev",
      "jquerytools": "//8.jquerytools.site.freebase.dev",
      "queries": "//8.queries.site.freebase.dev",

      // external apps
      "libraries": "//libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "schema.mf.css": [
      ["template", "freebase.mf.css"],
      ["template", "freebase.table.less"],
      "schema.less"
    ]
  },
  "javascript": {
    "schema.mf.js": [
      ["template", "freebase.mf.js"],
      ["jquerytools", "tabs.js"],
      ["jquerytools", "tooltip.js"],
      "schema.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/ca8bb1c7bb678a4e3f53a94f7b1a937f", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/ca8bb1c7bb678a4e3f53a94f7b1a937f"});
