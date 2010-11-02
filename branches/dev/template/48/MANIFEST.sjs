var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/6f2363f03d74042dbace45033044998f", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/6f2363f03d74042dbace45033044998f"});
