
var mf = {
  "apps" : {
    "core": "//16.core.site.freebase.dev"    
  }
};

acre.require(mf.apps.core + "/MANIFEST").init(mf, this);
