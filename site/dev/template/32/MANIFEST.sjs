var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/c45b4d06f53e0fda0f586c853ee08d69", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/c45b4d06f53e0fda0f586c853ee08d69"});
