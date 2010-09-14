var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/370f02083cef906617d368def141c2e2", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/370f02083cef906617d368def141c2e2"});
