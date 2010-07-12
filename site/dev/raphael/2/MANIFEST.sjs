/**
 * Raphael and Graph Raphael
 * http://raphaeljs.com/
 * http://g.raphaeljs.com/
 */
var MF = {
  "apps": {
    "core": "//2.core.site.freebase.dev"
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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/raphael/7b778aeaad636bff0937bb36af4f60f3", "static_base_url": "http://freebaselibs.com/static/freebase_site/raphael/7b778aeaad636bff0937bb36af4f60f3"});
