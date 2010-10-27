var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/c6aabde39707b5e844a75730788c76ec", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/c6aabde39707b5e844a75730788c76ec"});
