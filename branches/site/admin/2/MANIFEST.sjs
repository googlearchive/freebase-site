var mf = JSON.parse(acre.require("CONFIG.json").body);
acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/admin/9106bc89317fd6eef14937d1f5aa6f2b", "static_base_url": "http://freebaselibs.com/static/freebase_site/admin/9106bc89317fd6eef14937d1f5aa6f2b"});
