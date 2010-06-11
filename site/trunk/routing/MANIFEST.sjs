

var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/homepage": null,
    "/freebase/site/sample": null,
    "/freebase/site/domain": null,
    "/freebase/site/schema": null,
    "/freebase/site/toolbox": null,
    "/freebase/site/error": null
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
