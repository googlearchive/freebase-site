var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/a560dd9d916a921dadd166f88cae5e9e", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/a560dd9d916a921dadd166f88cae5e9e"});
