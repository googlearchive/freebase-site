var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/2c012eec225b7b75fa6b529c4d1291c9", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/2c012eec225b7b75fa6b529c4d1291c9"});
