var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/eb2e33993469c0b3e9cbdb3a0ead195f", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/eb2e33993469c0b3e9cbdb3a0ead195f"});
