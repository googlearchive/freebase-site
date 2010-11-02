var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/dfcf64ec46d835339fa8a14309bb38ce", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/dfcf64ec46d835339fa8a14309bb38ce"});
