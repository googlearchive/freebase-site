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

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/raphael/dae1958788330631e3c575666ebaf615", "static_base_url": "http://freebaselibs.com/static/freebase_site/raphael/dae1958788330631e3c575666ebaf615"});
