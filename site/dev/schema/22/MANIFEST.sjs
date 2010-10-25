var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/1bd3695207a003efb898da47b23cae39", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/1bd3695207a003efb898da47b23cae39"});
