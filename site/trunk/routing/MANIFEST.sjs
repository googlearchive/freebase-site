

var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/sample": "1",
    "/freebase/site/domain": null
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);


console.log("/sample/foo".startsWith("/sample"));
try {
  acre.require("/freebase/site/sample/index2");
  }
catch(ex) {
  console.log(ex.prototype, ex.constructor, ex);
}


[1,2,3,4].every(function(i) {
                  console.log("i", i);
                  if (i === 3) {
                    return false;
                  }
                  return true;
                });
