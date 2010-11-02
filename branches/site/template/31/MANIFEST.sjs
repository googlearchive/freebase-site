var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/2c3049c64a1cace9d9aae151fed9570e", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/2c3049c64a1cace9d9aae151fed9570e"});
