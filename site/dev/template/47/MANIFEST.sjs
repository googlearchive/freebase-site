var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/55e1d7eb67551480e9e184f12d734f8d", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/55e1d7eb67551480e9e184f12d734f8d"});
