var MF = {
  "apps": {
    "core": "//core.site.freebase.dev"
  },
  test: {
    files: ['test_apis', 'test_deferred']
  }
};

// acre.require(MF.apps.core).init(MF, this);
// temporary hack until acre.require supports new syntax
acre.require("/freebase/site/core/MANIFEST").init(MF, this);
