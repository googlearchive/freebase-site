var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/00d42b632bb179b13b1241d9b0a08dd5", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/00d42b632bb179b13b1241d9b0a08dd5"});
