var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/383d4501083cabf605b61411c9d559bc", "static_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/383d4501083cabf605b61411c9d559bc"});
