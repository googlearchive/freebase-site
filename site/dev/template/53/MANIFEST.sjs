var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/13015725a11c4bf5699b18f43506f7b6", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/13015725a11c4bf5699b18f43506f7b6"});
