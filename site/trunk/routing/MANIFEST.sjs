

var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/sample": "1",
    "/freebase/site/domain": null
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
