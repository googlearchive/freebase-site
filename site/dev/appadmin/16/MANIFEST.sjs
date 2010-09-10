var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/7a0a543db0a34f1eae3c99d7b122e797", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/7a0a543db0a34f1eae3c99d7b122e797"});
