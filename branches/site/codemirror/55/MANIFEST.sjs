var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/0f8ce09e5eed051917c26f6dbb184dff", "static_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/0f8ce09e5eed051917c26f6dbb184dff"});
