
var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/template": null
  },
    'apps' : { 
        'template' : '//release.template.site.freebase.dev',
        'core' : '//release.core.site.freebae.dev'
    },
  stylesheet: {
    "error.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css"]
  },
  javascript: {
    "error.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js"]
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
