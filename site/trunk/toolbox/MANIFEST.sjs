
var MF = {
  version: {
    "/freebase/site/core": null,
    "/freebase/site/promise": null,
    "/freebase/apps/appeditor": "release"
  },

  'apps' : { 
      'core' : '//release.core.site.freebase.dev',
      'promise' : '//release.promise.core.site.freebase.dev',
      'appeditor' : '//release.appeditor.apps.freebase.dev'
  },
};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
