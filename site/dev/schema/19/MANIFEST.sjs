var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/schema/a72355b31937ce2a05cf3dbf8be053f7", "static_base_url": "http://freebaselibs.com/static/freebase_site/schema/a72355b31937ce2a05cf3dbf8be053f7"});