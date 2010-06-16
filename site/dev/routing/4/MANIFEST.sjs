

var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/homepage": null,
    "/freebase/site/sample": null,
    "/freebase/site/domain": null,
    "/freebase/site/schema": null,
    "/freebase/site/toolbox": null,
    "/freebase/site/appadmin": null,
    "/freebase/site/error": null
  }
};

function is_release_pod() { 
    return /^https?:\/\/(www\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url);
}

if (is_release_pod()) { 
    for (var appid in MF.version) { 
        MF.version[appid] = "release";
    }
}


acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
