var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/566b37db3ef1e4255a51c110fa543a40", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/566b37db3ef1e4255a51c110fa543a40"});
