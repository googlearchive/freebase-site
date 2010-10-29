var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/30935199c456b781c9a1dd50be6b8e8a", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/30935199c456b781c9a1dd50be6b8e8a"});
