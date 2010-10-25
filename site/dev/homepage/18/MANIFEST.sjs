var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/9a9eeb256f7251215be7f309f9b9243f", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/9a9eeb256f7251215be7f309f9b9243f"});
