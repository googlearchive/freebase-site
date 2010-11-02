var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/bd2ec3f151f55dc9a75c2c466f976523", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/bd2ec3f151f55dc9a75c2c466f976523"});