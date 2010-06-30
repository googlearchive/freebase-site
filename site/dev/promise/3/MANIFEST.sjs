var MF = {
  "apps": {
    "core": "//5.core.site.freebase.dev"
  },
  "test": {
    "files": ['test_apis', 'test_deferred']
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/promise/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/promise/$Rev$"});
