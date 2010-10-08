var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/5fdd2c4a015d167a11fc8c6495b53c56", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/5fdd2c4a015d167a11fc8c6495b53c56"});