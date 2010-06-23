var MF = {

  version: {
      "/freebase/site/core": "release",
      "/freebase/site/template" : "release",
      "/test/lib" : "release"
  },
  'apps' : { 
      'core' : '//release.core.site.freebase.dev',
      'template' : '//release.template.site.freebase.dev',
      'promise' : '//release.promise.site.freebase.dev'
  },
  'test' : {
      'files' : ['test_new_ids']
  },

  stylesheet: {
      "appadmin.mf.css": ["/freebase/site/template/MANIFEST/freebase.mf.css", "appadmin_core.css"]
  },

  javascript: {
      "appadmin.mf.js": ["/freebase/site/template/MANIFEST/freebase.mf.js", "appadmin_core.js"]
  }

};

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/$Rev$", "static_base_url": "http://freebaselibs.com/static/freebase_site/appadmin/$Rev$"});