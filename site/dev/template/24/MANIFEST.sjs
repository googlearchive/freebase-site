var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/99ecdedb4293b5855a5eaf74d2601572", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/99ecdedb4293b5855a5eaf74d2601572"});
