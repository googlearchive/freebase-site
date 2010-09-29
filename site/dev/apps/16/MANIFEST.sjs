var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/apps/f5cbc9e60d46a53f635060fa0e48959e", "static_base_url": "http://freebaselibs.com/static/freebase_site/apps/f5cbc9e60d46a53f635060fa0e48959e"});
