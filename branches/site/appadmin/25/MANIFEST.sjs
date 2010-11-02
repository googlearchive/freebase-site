var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/f965a06d896842904091bad06d9ccfde", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/f965a06d896842904091bad06d9ccfde"});
