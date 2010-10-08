var mf = JSON.parse(acre.require("CONFIG.json").body);







acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/78abd0a2427026bd1c81a6053e21cddc", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/78abd0a2427026bd1c81a6053e21cddc"});
