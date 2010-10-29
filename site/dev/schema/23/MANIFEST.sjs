var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/5464b8efd7350882ccedafc600a9ff63", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/5464b8efd7350882ccedafc600a9ff63"});
