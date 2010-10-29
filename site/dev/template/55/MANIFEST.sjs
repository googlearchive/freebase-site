var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/e53735a6c0de8f25be9df10646d43298", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/e53735a6c0de8f25be9df10646d43298"});
