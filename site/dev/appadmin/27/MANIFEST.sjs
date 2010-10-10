var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/4c51d9bc916910d9bfa95707404e403c", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/4c51d9bc916910d9bfa95707404e403c"});
