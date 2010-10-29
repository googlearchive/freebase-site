var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ea3073ebb3d2de5ee6ad34af41db9b5b", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/ea3073ebb3d2de5ee6ad34af41db9b5b"});
