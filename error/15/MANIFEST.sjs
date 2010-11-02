var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/210bdd01664ce1418b8b6b3f00e6490e", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/210bdd01664ce1418b8b6b3f00e6490e"});
