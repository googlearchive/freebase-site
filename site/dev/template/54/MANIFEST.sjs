var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/f27d0bef3bf6bc8ce3416af9c83b2fa3", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/f27d0bef3bf6bc8ce3416af9c83b2fa3"});
