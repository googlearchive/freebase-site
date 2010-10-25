var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/7d856b4970657785d07f27db7d543a5c", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/7d856b4970657785d07f27db7d543a5c"});
