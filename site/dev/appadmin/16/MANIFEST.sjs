var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/2fccd7c66e48bf408944131d78141aa4", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/2fccd7c66e48bf408944131d78141aa4"});
