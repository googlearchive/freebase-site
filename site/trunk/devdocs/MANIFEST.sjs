var MF = {
  "apps": {
    "core": "//core.site.freebase.dev",
    "template": "//template.site.freebase.dev",
    "promise": "//promise.site.freebase.dev",

    "libraries": "//libraries.apps.freebase.dev"
  },
  "stylesheet": {
    "docs_style.mf.css": [
      ["template", "MANIFEST", "/freebase.mf.css"],
      "docs_style.css"
    ]
  },
  "javascript": {
    "index.mf.js": [
      ["template", "MANIFEST", "/freebase.mf.js"]
    ]
  },

  // devdoc specific metadata
  
  "version": {
    "/freebase/apps/global"               :  "52",
    "/freebase/apps/home"                 :  "85",
    "/user/dfhuynh/datadocs"              : "release",
    "/user/stefanomazzocchi/acredocs"     : "release",
    "/user/jdouglas/mql"                  : "release",
    "/user/jdouglas/templates"            : "release",
    "/user/dfhuynh/acreassist"            : "release",
    "/user/stefanomazzocchi/jscheatsheet" : "release",
    "/user/fbclient/libtopic"             : "release"
  },
  "urls" : {
    "cheatsheet"       : "http://download.freebase.com/MQLcheatsheet-081208.pdf",
    "query_recipes"    : "http://wiki.freebase.com/wiki/MQL_Recipes",
    "client_libraries" : "http://wiki.freebase.com/wiki/Libraries",
    "acre_recipes"     : "http://wiki.freebase.com/wiki/Acre_Recipes",
    "acre_wiki"        : "http://wiki.freebase.com/wiki/Acre",
    "data_dumps"       : "http://wiki.freebase.com/wiki/Data_dumps"
  }


};

acre.require(MF.apps.core + "/MANIFEST").init(MF, this);
