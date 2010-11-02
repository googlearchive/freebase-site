var mf = JSON.parse(acre.require("CONFIG.json").body);

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/devdocs/52086be86d2784f6ddcd956cc2e0b9e5", "static_base_url": "http://freebaselibs.com/static/freebase_site/devdocs/52086be86d2784f6ddcd956cc2e0b9e5"});
