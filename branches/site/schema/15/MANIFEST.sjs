var MF = {
  "apps": {
      "core": "//15.core.site.freebase.dev",
      "routing": "//15.routing.site.freebase.dev",
      "template": "//15.template.site.freebase.dev",
      "promise": "//14.promise.site.freebase.dev",
      "jquerytools": "//14.jquerytools.site.freebase.dev",
      "queries": "//15.queries.site.freebase.dev",

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
      ["template", "jquery.showrow.js"],
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
      ["jquerytools", "toolbox.expose.js"],
      ["jquerytools", "overlay.js"],
      "schema-edit.js",
      "domain-edit.js"
    ],
    "type.mf.js": [
      "schema.mf.js",
      "type.js"
    ],
    "type-edit.mf.js": [
      ["jquerytools", "toolbox.expose.js"],
      ["jquerytools", "overlay.js"],
      "schema-edit.js",
      "suggest_expected_type.js",
      "suggest_property.js",
      "type-edit.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/d96afd62625a5dc4966e8ad4b732bf75", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/d96afd62625a5dc4966e8ad4b732bf75"});
