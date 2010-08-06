var MF = {
  "apps": {
    "core": "//13.core.site.freebase.dev",
    "template": "//13.template.site.freebase.dev",
    "promise": "//13.promise.site.freebase.dev",

    "libraries": "//libraries.apps.freebase.dev",
    
    //devdoc list
    "datadocs":     "//release.datadocs.dfhuynh.user.dev",
    "acredocs":     "//release.acredocs.stefanomazzocchi.user.dev",
    "mql":          "//release.mql.jdouglas.user.dev",
    "devdocs": "//13.devdocs.site.freebase.dev",
    "mjt":          "//release.templates.jdouglas.user.dev",
    "acreassist":   "//release.acreassist.dfhuynh.user.dev",
    "jscheatsheet": "//release.jscheatsheet.stefanomazzocchi.user.dev",
    "libtopic":     "//release.libtopic.fbclient.user.dev"

  },
  "stylesheet": {
    "docs_style.mf.css": [
      ["template", "freebase.mf.css"],
      "docs_style.css"
    ]
  },
  "javascript": {
    "index.mf.js": [
      ["template", "freebase.mf.js"]
    ]
  },

  // devdoc-specific links
  "urls" : {
    "cheatsheet"       : "http://download.freebase.com/MQLcheatsheet-081208.pdf", //XXX: this link is dead
    "query_recipes"    : "http://wiki.freebase.com/wiki/MQL_Recipes",
    "client_libraries" : "http://wiki.freebase.com/wiki/Libraries",
    "acre_recipes"     : "http://wiki.freebase.com/wiki/Acre_Recipes",
    "acre_wiki"        : "http://wiki.freebase.com/wiki/Acre",
    "data_dumps"       : "http://wiki.freebase.com/wiki/Data_dumps"
  }


};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
