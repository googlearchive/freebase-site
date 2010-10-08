var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/f09e55b4958005c498927b50d88925c6", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/f09e55b4958005c498927b50d88925c6"});