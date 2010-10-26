var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/c9ee8c00d036a71027c7ce955de41e3f", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/c9ee8c00d036a71027c7ce955de41e3f"});
