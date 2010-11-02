var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/cdae788a51f1c8770a8cc81e8c95232d", "static_base_url": "http://freebaselibs.com/static/freebase_site/appeditor/cdae788a51f1c8770a8cc81e8c95232d"});
