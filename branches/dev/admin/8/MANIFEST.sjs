var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/admin/5d6ae383325a26d7e3364ada8d9a54c7", "static_base_url": "http://freebaselibs.com/static/freebase_site/admin/5d6ae383325a26d7e3364ada8d9a54c7"});
