var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/8991ec465755975d31934398234782a8", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/8991ec465755975d31934398234782a8"});
