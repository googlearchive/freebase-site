var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ab1705a03e4bdf431c92cd920c4563b9", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ab1705a03e4bdf431c92cd920c4563b9"});
