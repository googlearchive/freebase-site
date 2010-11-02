var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/apps/0ea1bce7a3c2249b9839477d9ffef37b", "static_base_url": "http://freebaselibs.com/static/freebase_site/apps/0ea1bce7a3c2249b9839477d9ffef37b"});
