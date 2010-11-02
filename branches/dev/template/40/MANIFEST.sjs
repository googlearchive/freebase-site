var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/e04ee32e6988612cca566672ed9ca056", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/e04ee32e6988612cca566672ed9ca056"});
