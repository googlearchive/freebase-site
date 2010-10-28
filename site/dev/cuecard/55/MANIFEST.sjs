var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/511a88e98a869f0a4e7d2f09635d03d2", "static_base_url": "http://freebaselibs.com/static/freebase_site/cuecard/511a88e98a869f0a4e7d2f09635d03d2"});
