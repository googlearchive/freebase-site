var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/290c7bfa835a304418f3fcd6cc9d5ce3", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/290c7bfa835a304418f3fcd6cc9d5ce3"});
