var MF = {
  "apps": {
      "core": "//3.core.site.freebase.dev",
      "template": "//3.template.site.freebase.dev",
      "promise": "//3.promise.site.freebase.dev",
      "jquerytools": "//3.jquerytools.site.freebase.dev",
      "domain": "//3.domain.site.freebase.dev",
      "queries": "//3.queries.site.freebase.dev",

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
      ["domain", "jquery.tablesorter.js"],
      "schema.js"
    ],
    "schema-landing.mf.js": [
      ["template", "freebase.mf.js"],
      ["jquerytools", "tabs.js"],
      ["domain", "jquery.tablesorter.js"],
      "schema-landing.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/1a92ed7fae79031a6649b8c5cfa802ab", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/1a92ed7fae79031a6649b8c5cfa802ab"});
