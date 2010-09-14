var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/3255010b7be8e76d8c591263129c967b", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/3255010b7be8e76d8c591263129c967b"});
