var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/680a96a717f0f4c708fd14fc6af00075", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/680a96a717f0f4c708fd14fc6af00075"});
