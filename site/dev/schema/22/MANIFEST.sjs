var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/cfd1b1ca1da8b437c328d82cfed7e8b3", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/cfd1b1ca1da8b437c328d82cfed7e8b3"});
