var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/8cae8f9ebdc85f548cf942b3c8610c76", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/8cae8f9ebdc85f548cf942b3c8610c76"});
