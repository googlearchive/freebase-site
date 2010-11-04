var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/a9a6a3d5a293b55143be441e4196871f", "static_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/a9a6a3d5a293b55143be441e4196871f"});
