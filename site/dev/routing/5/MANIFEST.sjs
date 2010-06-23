

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
  },
  'apps' : { 
      'core' : '//core.site.freebase.dev',
      'template' : '//core.site.freebase.dev',
      'sample' : '//sample.site.freebase.dev',
      'domain' : '//domain.site.freebase.dev',
      'schema' : '//schema.site.freebase.dev',
      'toolbox': '//toolbox.site.freebase.dev',
      'appadmin' : '//appadmin.site.freebase.dev',
      'error' : '//error.site.freebase.dev',
      "homepage" : '//homepage.site.freebase.dev'
  },

};

function is_release_pod() { 
    return /^https?:\/\/(www\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url);
}

if (is_release_pod()) { 
    for (var appid in MF.version) { 
        MF.version[appid] = "release";
    }

    for (var label in MF.apps) { 
        MF.apps[label] = '//release.' + MF.apps[label].slice(2);
    }
}


acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
