var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/c680c38194b063d3d2a0c6530dd07989", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/c680c38194b063d3d2a0c6530dd07989"});
