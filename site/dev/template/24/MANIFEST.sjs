var mf = JSON.parse(acre.require("CONFIG.json").body);
mf.suggest.base_url += mf.suggest.version;
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/template/6e8d3d77a4447fa31dba370347190377", "static_base_url": "http://freebaselibs.com/static/freebase_site/template/6e8d3d77a4447fa31dba370347190377"});
