var MF = {
  "apps" : {
    "core": "//15.core.site.freebase.dev"
  }
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/validator/d41d8cd98f00b204e9800998ecf8427e", "static_base_url": "http://freebaselibs.com/static/freebase_site/validator/d41d8cd98f00b204e9800998ecf8427e"});
