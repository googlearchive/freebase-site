var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/6ffc7fb555d0d483c2238710f9c46fa0", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/6ffc7fb555d0d483c2238710f9c46fa0"});