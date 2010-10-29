var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/c7920643eb812a64abd8b4fdf1e3c8da", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/c7920643eb812a64abd8b4fdf1e3c8da"});
