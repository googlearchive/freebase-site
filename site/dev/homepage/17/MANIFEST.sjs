var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/cb37b862991ef37df3629a593f62f4cf", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/cb37b862991ef37df3629a593f62f4cf"});