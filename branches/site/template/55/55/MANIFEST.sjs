var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/167a1fbd2b0c0c9b447f607490f5eca4", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/167a1fbd2b0c0c9b447f607490f5eca4"});
