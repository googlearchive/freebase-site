
var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/promise": null,
    "/freebase/apps/appeditor": "release"
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
