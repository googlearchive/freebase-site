var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/25865c0a9c7cf18b994de58a65c5e481", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/25865c0a9c7cf18b994de58a65c5e481"});
