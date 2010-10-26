var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/06b54e5daad31279073b420630fd15f4", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/06b54e5daad31279073b420630fd15f4"});
