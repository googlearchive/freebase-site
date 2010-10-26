var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/8b5e295e307d0ad4ec99f69a83806a16", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/8b5e295e307d0ad4ec99f69a83806a16"});
