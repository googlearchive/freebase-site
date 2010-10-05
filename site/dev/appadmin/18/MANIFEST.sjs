var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/dda3c4a5d7a8fc9f0b77d903f408ca2c", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/dda3c4a5d7a8fc9f0b77d903f408ca2c"});
