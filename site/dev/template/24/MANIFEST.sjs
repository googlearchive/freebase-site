var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/a82191abf07ca539ea51d24b898489c2", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/a82191abf07ca539ea51d24b898489c2"});
