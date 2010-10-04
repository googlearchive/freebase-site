var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/24cda84c5610179d69739c89b26d1851", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/24cda84c5610179d69739c89b26d1851"});
