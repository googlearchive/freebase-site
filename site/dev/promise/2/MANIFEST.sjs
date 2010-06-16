var MF = {

  version: {
    "/freebase/site/core": null
  },
  
  test: {
    files: ['test_apis', 'test_deferred']
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
