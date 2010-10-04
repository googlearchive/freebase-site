var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/160dd0fb3e0140772e94e2738a587400", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/160dd0fb3e0140772e94e2738a587400"});
