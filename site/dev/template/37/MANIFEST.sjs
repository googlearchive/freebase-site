var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/a8538b1a0af5338234e6c446ecaf84be", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/a8538b1a0af5338234e6c446ecaf84be"});
