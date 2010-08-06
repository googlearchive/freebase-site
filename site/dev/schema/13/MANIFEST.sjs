var MF = {
  "apps": {
      "core": "//13.core.site.freebase.dev",
      "template": "//13.template.site.freebase.dev",
      "promise": "//13.promise.site.freebase.dev",
      "jquerytools": "//13.jquerytools.site.freebase.dev",
      "queries": "//13.queries.site.freebase.dev",

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
      ["template", "freebase-permission.mf.js"],
      ["jquerytools", "tabs.js"],
      ["jquerytools", "tooltip.js"],
      "schema.js"
    ],
    "index.mf.js": [
      "schema.mf.js",
      "index.js"
    ],
    "domain.mf.js": [
      "schema.mf.js",
      "domain.js"
    ],
    "domain-edit.mf.js": [
      "domain-edit.js"
    ],
    "type.mf.js": [
      "schema.mf.js",
      "type.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/c524d0f4f8b7638015ee9575c7863676", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/c524d0f4f8b7638015ee9575c7863676"});
