var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/19f3f1e556d132b2f0fecffe80e1102d", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/19f3f1e556d132b2f0fecffe80e1102d"});
