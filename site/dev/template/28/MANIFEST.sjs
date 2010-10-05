var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/62c926ec3e370667b466e4f2c9007dbf", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/62c926ec3e370667b466e4f2c9007dbf"});
