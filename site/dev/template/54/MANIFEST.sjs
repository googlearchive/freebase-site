var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/f12c3cb99f8089627ecf6db092eb9dcb", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/f12c3cb99f8089627ecf6db092eb9dcb"});
