var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/8891ffebda10dd063d0b300706e4f275", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/8891ffebda10dd063d0b300706e4f275"});
