var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/1156f35318e723fa5201fdcd8f9c0587", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/1156f35318e723fa5201fdcd8f9c0587"});
