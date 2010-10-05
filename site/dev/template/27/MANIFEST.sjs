var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/b0ce0e537d5af7c4fff6e27c917ee0b1", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/b0ce0e537d5af7c4fff6e27c917ee0b1"});
