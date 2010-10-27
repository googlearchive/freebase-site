var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/09e7cf1ff28d9fb0276463c93b2934b6", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/09e7cf1ff28d9fb0276463c93b2934b6"});
