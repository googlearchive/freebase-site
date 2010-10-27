var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/admin/ccf55aa8d484d640721ff7fec9860996", "static_base_url": "http://freebaselibs.com/static/freebase_site/admin/ccf55aa8d484d640721ff7fec9860996"});
