var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/f46f52b72d5f027e4b1939c3a618cdb6", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/f46f52b72d5f027e4b1939c3a618cdb6"});
