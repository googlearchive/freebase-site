

var MF = {
  version: {
    "/freebase/site/core": "release",
    "/freebase/site/homepage": "release",
    "/freebase/site/sample": "release",
    "/freebase/site/domain": "release",
    "/freebase/site/schema": "release",
    "/freebase/site/toolbox": "release",
    "/freebase/site/appadmin": "release",
    "/freebase/site/error": "release"
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
