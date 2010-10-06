var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/triples/2d0fc9573a313007d5cc93580df94730", "static_base_url": "http://freebaselibs.com/static/freebase_site/triples/2d0fc9573a313007d5cc93580df94730"});
