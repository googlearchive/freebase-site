
var MF = {
  "apps": {
    "core": "//1.core.site.freebase.dev",
    "template": "//1.template.site.freebase.dev"
  },
  stylesheet: {
    "error.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"]
    ]
  },
  javascript: {
    "error.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"]
    ]
  }
};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/6f9a14a63c14a582938acc97a57f8010", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/6f9a14a63c14a582938acc97a57f8010"});
