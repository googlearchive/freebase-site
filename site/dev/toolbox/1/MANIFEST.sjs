
var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/promise": null,
    "/freebase/apps/appeditor": "release"
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/toolbox/$Rev$"});
