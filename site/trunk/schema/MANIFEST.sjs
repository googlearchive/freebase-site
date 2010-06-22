
var MF = {

  version: {
    "/freebase/site/core" : null,
    "/freebase/site/template": null,
    "/freebase/apps/libraries" : "release",
    "/user/pak21/schemaviz" : null
  },
  'apps' : { 
      'core' : '//release.core.site.freebase.dev',
      'template' : '//release.template.site.freebase.dev',
      'libraries' : '//release.libraries.apps.freebase.dev',
      'schemaviz' : '//release.schemaviz.pak21.user.dev'
  },

  stylesheet: {
    "schema.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "schema.css"]
  },

  javascript: {
    "schema.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", "schema.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
