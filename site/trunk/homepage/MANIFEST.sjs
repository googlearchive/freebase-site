
var MF = {
  "version": {
    "/freebase/site/core": null,
    "/freebase/site/template": null,
    "/freebase/site/promise": null
  },
  'apps' : { 
      'core' : '//release.core.site.freebase.dev',
      'template' : '//release.template.site.freebase.dev',
      'libraries' : '//release.libraries.apps.freebase.dev',
      'promise' : '//release.promise.site.freebase.dev'
  },
  
  "stylesheet": {
    "index.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "homepage.css"]
  },

  "javascript": {
    "index.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", 
                    "jquery.tools.tabs.min.js", "jquery.equalizecols.js", "homepage.js"]
  }
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
