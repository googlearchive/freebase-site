var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/e0a98b9c60a5abaf121b4499d193586c", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/e0a98b9c60a5abaf121b4499d193586c"});
