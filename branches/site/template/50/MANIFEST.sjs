var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/8b0601ec167780b4951c51b5cac70e76", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/8b0601ec167780b4951c51b5cac70e76"});
