var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/4c9d8481c80fc6035b330b85b4060d42", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/4c9d8481c80fc6035b330b85b4060d42"});
