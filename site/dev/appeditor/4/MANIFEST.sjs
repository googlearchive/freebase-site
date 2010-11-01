var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/36dee8fb91924e0e2c916471e939d0ff", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/36dee8fb91924e0e2c916471e939d0ff"});
