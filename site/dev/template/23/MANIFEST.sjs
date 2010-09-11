var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/3d1c3801d0272a86c4b432128bc6b4ea", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/3d1c3801d0272a86c4b432128bc6b4ea"});
