var mf = {
  "apps": {
      "core": "//core.site.freebase.dev"
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

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
