var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/435a3a4dedc1d5a1a44c3240416f105c", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/435a3a4dedc1d5a1a44c3240416f105c"});
