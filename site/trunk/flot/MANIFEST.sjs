/**
 * Flot jQuery Library
 * http://raphaeljs.com/
 * http://g.raphaeljs.com/
 */
var MF = {
  "apps": {
    "core": "//7.core.site.freebase.dev"
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

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
