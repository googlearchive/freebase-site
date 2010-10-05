var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/8e9aebc04146db9845ff7071d4278e81", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/8e9aebc04146db9845ff7071d4278e81"});
