var MF = {
  "apps": {
      "core": "//6.core.site.freebase.dev",
      "template": "//6.template.site.freebase.dev",
      "promise": "//6.promise.site.freebase.dev",
      "jquerytools": "//6.jquerytools.site.freebase.dev",
      "queries": "//6.queries.site.freebase.dev",

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
      "jquery.tablesorter.js",
      "schema.js"
    ],
    "schema-landing.mf.js": [
      ["template", "freebase.mf.js"],
      ["jquerytools", "tabs.js"],
      "jquery.tablesorter.js",
      "schema-landing.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/d6b279cbca419d07ee0186e6a16cb66a", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/d6b279cbca419d07ee0186e6a16cb66a"});
