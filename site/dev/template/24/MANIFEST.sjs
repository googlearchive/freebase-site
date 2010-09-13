var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/75bce8455e2804d86c0ce50ab0a425d5", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/75bce8455e2804d86c0ce50ab0a425d5"});
