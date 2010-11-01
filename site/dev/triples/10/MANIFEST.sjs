var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/b5d779487f218f8e65d459b912da1e11", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/b5d779487f218f8e65d459b912da1e11"});
