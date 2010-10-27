var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/413eef6ecc4ae4e39614a144feb754a5", "static_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/413eef6ecc4ae4e39614a144feb754a5"});
