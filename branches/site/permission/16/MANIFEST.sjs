var mf = {
  "apps": {
      "core": "//16.core.site.freebase.dev"
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/permission/d41d8cd98f00b204e9800998ecf8427e", "static_base_url": "http://freebaselibs.com/static/freebase_site/permission/d41d8cd98f00b204e9800998ecf8427e"});
