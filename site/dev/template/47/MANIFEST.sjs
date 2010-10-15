var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/7827e44dfce00efa5574c9623c90be3e", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/7827e44dfce00efa5574c9623c90be3e"});
