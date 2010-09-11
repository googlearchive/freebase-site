var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/1e3f84031af59b25f24a582616c9e6d9", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/1e3f84031af59b25f24a582616c9e6d9"});
