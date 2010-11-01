var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/2a863faf2c062d140139d4148b4ec894", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/2a863faf2c062d140139d4148b4ec894"});
