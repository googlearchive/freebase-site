var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/b3e7cb285c8bb8f02ac472f2ad988886", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/b3e7cb285c8bb8f02ac472f2ad988886"});
