var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/cf2ef9138d33a576670c2c9520bab2b5", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/cf2ef9138d33a576670c2c9520bab2b5"});
