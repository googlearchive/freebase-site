var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/840c71dd7356e5ab07f45b5a5ea8ceb6", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/840c71dd7356e5ab07f45b5a5ea8ceb6"});
