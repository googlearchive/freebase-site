var MF = {
  "version": {
    "/freebase/site/core": null,
    "/freebase/site/promise": null,
    "/freebase/site/toolbox": null
  },
  "suggest" : {
    "version": "1.2.1",
    "base_url": "http://freebaselibs.com/static/suggest/"
  },
  "jquery" : {
    "version" : "1.4"
  },
  "javascript": {
    "freebase.mf.js": ['jquery.cookie.js', 'jquery.ui.position.js', 
                       'freebase.js', "/freebase/site/toolbox/toolbox.js"]
  },
  "stylesheet": {
    "freebase.mf.css": ["freebase.less", "components.less", 
                        "/freebase/site/toolbox/toolbox.less"]
  }
};
MF.suggest.base_url += MF.suggest.version;

acre.require("/freebase/site/core/MANIFEST", MF.version["/freebase/site/core"]).init(MF, this);
