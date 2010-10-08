var mf = JSON.parse(acre.require("CONFIG.json").body);



acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/77fd9f353b1228813ab582edc09600c2", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/77fd9f353b1228813ab582edc09600c2"});
