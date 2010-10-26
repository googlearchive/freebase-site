var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/5e0d2f0741228d14b4f4d144da6fc9a5", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/5e0d2f0741228d14b4f4d144da6fc9a5"});
