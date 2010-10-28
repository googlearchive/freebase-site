var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/8671bf9b874572747b3010183e4f5d94", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/8671bf9b874572747b3010183e4f5d94"});
