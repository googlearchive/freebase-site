var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/d0875f95e6a9436882eaad654d95d90f", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/d0875f95e6a9436882eaad654d95d90f"});
