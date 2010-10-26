var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/c480d1385db5cb89bab72a1c7af550d7", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/c480d1385db5cb89bab72a1c7af550d7"});
