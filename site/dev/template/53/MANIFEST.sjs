var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/8a4203f8959096c98e9cb806a9911aa5", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/8a4203f8959096c98e9cb806a9911aa5"});
