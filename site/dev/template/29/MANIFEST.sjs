var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/2e46e2b05b02f6f4e43683d211e85a1c", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/2e46e2b05b02f6f4e43683d211e85a1c"});
