var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/apps/3afe1c3a161d6461a32bf07f0f65dc3e", "static_base_url": "http://freebaselibs.com/static/freebase_site/apps/3afe1c3a161d6461a32bf07f0f65dc3e"});
