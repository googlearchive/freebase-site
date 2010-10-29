var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/bf10742de7b2982c94ab7095119e315f", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/bf10742de7b2982c94ab7095119e315f"});
