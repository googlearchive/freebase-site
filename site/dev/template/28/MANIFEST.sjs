var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/f20c6932614aaa066bda2ff7ea8f0da0", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/f20c6932614aaa066bda2ff7ea8f0da0"});
