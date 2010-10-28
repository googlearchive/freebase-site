var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/a67abcdec07a086e23b3a81cf5e7ed39", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/a67abcdec07a086e23b3a81cf5e7ed39"});
