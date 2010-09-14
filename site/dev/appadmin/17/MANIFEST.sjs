var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/dd11b151e137294b6c7677ee79e2c9d8", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/dd11b151e137294b6c7677ee79e2c9d8"});
