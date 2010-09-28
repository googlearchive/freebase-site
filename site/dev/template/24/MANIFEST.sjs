var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/82c053f367b41712f597d0b07c174aa8", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/82c053f367b41712f597d0b07c174aa8"});
