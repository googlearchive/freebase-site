var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/9c8407214f8ea18133d25271a8ca550a", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/9c8407214f8ea18133d25271a8ca550a"});
