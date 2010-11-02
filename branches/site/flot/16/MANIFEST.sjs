/**
 * Flot jQuery Library
 * http://raphaeljs.com/
 * http://g.raphaeljs.com/
 */
var mf = {
  "apps": {
    "core": "//16.core.site.freebase.dev"
  },
  "javascript": {
    "flot.core.mf.js": [
      "excanvas.js",
      "jquery.flot.js",
      "jquery.colorhelpers.js"
    ],
    "flot.all.mf.js": [
      "flot.core.mf.js",
      "jquery.flot.fillbetween.js",
      "jquery.flot.navigate.js",
      "jquery.flot.stack.js",
      "jquery.flot.image.js",
      "jquery.flot.pie.js",
      "jquery.flot.threshold.js",
      "jquery.flot.crosshair.js",
      "jquery.flot.selection.js"
    ]
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/flot/c034424ee4c63f51856ddd1851499602", "static_base_url": "http://freebaselibs.com/static/freebase_site/flot/c034424ee4c63f51856ddd1851499602"});
