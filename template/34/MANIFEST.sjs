var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/8d42ba27844823ce04d8a4c808b4f0fc", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/8d42ba27844823ce04d8a4c808b4f0fc"});
