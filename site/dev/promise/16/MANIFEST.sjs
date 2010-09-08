var mf = {
  "apps": {
    "core": "//core.site.freebase.dev"
  },
  "test": {
    "files": ['test_apis', 'test_deferred']
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
