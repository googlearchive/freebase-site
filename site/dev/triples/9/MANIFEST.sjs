var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/1498e6cfb4afc67f1e2596d147bc1ee3", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/1498e6cfb4afc67f1e2596d147bc1ee3"});
