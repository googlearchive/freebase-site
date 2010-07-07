/**
 * Raphael and Graph Raphael
 * http://raphaeljs.com/
 * http://g.raphaeljs.com/
 */
var MF = {
  "apps": {
    "core": "//1.core.site.freebase.dev"
  },
  "javascript": {
    "raphael.all.mf.js": [
      "raphael.js",
      "g.raphael.js",
      "g.bar.js",
      "g.dot.js",
      "g.line.js",
      "g.pie.js"
    ]
  }
};
if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
