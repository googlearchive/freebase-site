var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/7c17b1711e123baeda397aef44587537", "static_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/7c17b1711e123baeda397aef44587537"});
