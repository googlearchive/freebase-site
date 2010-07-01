
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

acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/error/0a43c2ae8f07ab03b49c367157a043c6", "static_base_url": "http://freebaselibs.com/static/freebase_site/error/0a43c2ae8f07ab03b49c367157a043c6"});
