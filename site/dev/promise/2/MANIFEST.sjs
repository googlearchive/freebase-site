var MF = {

  version: {
    "/freebase/site/core": null
  },
  
  test: {
    files: ['test_apis', 'test_deferred']
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/promise/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/promise/$Rev$"});
