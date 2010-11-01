var config = JSON.parse(acre.require("CONFIG.json").body);
var mf = acre.require(config.apps.core + "/MANIFEST").init(this, config, {"image_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/83f712871d6ff0109442b6be32da0434", "static_base_url": "http://freebaselibs.com/static/freebase_site/codemirror/83f712871d6ff0109442b6be32da0434"});
