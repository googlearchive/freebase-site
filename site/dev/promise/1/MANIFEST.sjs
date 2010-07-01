var MF = {
  "apps": {
    "core": "//1.core.site.freebase.dev"
  },
  "test": {
    "files": ['test_apis', 'test_deferred']
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
