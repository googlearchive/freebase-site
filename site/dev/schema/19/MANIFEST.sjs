var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/df7faff053c982cbb435501b611c437a", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/df7faff053c982cbb435501b611c437a"});