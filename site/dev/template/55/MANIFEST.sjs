var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/2da2d8e57e98ad05bf55d79c79b67021", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/2da2d8e57e98ad05bf55d79c79b67021"});
