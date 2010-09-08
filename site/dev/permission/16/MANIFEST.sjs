var mf = {
  "apps": {
      "core": "//core.site.freebase.dev"
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
