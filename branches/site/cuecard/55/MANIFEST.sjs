var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/5159075815b96cf5200d74b1c20bd52c", "static_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/5159075815b96cf5200d74b1c20bd52c"});
