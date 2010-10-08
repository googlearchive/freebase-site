var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/homepage/cfabd1d60c1ff882c84fe34aa7c3b249", "static_base_url": "http://freebaselibs.com/static/freebase_site/homepage/cfabd1d60c1ff882c84fe34aa7c3b249"});