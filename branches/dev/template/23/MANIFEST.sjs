var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/3210d50ce1564f90e0469963be9c07aa", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/3210d50ce1564f90e0469963be9c07aa"});
