var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/85033b494350161be3efbac027c0ffe4", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/85033b494350161be3efbac027c0ffe4"});
