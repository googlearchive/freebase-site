var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/d77329d4748867b4d91e3e67df695075", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/d77329d4748867b4d91e3e67df695075"});
