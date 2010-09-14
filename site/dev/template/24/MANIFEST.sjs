var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/28a4ed0576a14d1f97dadfb5af8861da", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/28a4ed0576a14d1f97dadfb5af8861da"});
