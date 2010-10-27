var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/fab4a411137cfeb8847d7233d2445785", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/fab4a411137cfeb8847d7233d2445785"});
