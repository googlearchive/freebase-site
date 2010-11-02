var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/admin/46149030c4da640f528ac958a13016e7", "static_base_url": "http://freebaselibs.com/static/freebase_site/admin/46149030c4da640f528ac958a13016e7"});
