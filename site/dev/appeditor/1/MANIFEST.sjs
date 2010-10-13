var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/bd94f7c6644f99e1e88e9808d7018387", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/bd94f7c6644f99e1e88e9808d7018387"});
