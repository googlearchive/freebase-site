var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/e8a86c8e43c998b122167be57b0d519c", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/e8a86c8e43c998b122167be57b0d519c"});
