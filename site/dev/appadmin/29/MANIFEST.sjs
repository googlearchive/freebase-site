var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/7161052f9d3a7fdd4b28253ebc8deda6", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/7161052f9d3a7fdd4b28253ebc8deda6"});
