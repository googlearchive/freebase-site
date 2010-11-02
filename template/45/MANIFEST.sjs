var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/da4e263f9b009dcff041e41d0b42a71d", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/da4e263f9b009dcff041e41d0b42a71d"});
