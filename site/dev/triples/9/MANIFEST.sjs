var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/dca939257dfbaef1473ee1563e5112ec", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/dca939257dfbaef1473ee1563e5112ec"});
