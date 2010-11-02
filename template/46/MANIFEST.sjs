var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/24d980557c7a5a1c159d67c58b4367b4", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/24d980557c7a5a1c159d67c58b4367b4"});
