var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/c4de561d86d0557d3f32ed2a11311666", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/c4de561d86d0557d3f32ed2a11311666"});
