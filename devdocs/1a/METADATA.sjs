var METADATA = {
  "app_version": "1", 
  "app_key": "devdocs", 
  "extensions": {
    "gif": {
      "media_type": "image/gif", 
      "handler": "tagged_binary"
    }, 
    "mf.css": {
      "media_type": "text/css", 
      "handler": "tagged_static"
    }, 
    "jpg": {
      "media_type": "image/jpg", 
      "handler": "tagged_binary"
    }, 
    "omf.js": {
      "media_type": "text/javascript", 
      "handler": "js_manifest"
    }, 
    "mf.js": {
      "media_type": "text/javascript", 
      "handler": "tagged_static"
    }, 
    "omf.css": {
      "media_type": "text/css", 
      "handler": "css_manifest"
    }, 
    "png": {
      "media_type": "image/png", 
      "handler": "tagged_binary"
    }
  }, 
  "urls": {
    "client_libraries": "http://wiki.freebase.com/wiki/Libraries", 
    "acre_wiki": "http://wiki.freebase.com/wiki/Acre", 
    "data_dumps": "http://wiki.freebase.com/wiki/Data_dumps", 
    "cheatsheet": "http://download.freebase.com/MQLcheatsheet-081208.pdf", 
    "query_recipes": "http://wiki.freebase.com/wiki/MQL_Recipes", 
    "acre_recipes": "http://wiki.freebase.com/wiki/Acre_Recipes"
  }, 
  "ttl": -1, 
  "mounts": {
    "acreassist": "//release.acreassist.dfhuynh.user.dev", 
    "lib": "//7j.lib.www.tags.svn.freebase-site.googlecode.dev", 
    "mql": "//release.mql.jdouglas.user.dev", 
    "libtopic": "//release.libtopic.fbclient.user.dev", 
    "mjt": "//release.templates.jdouglas.user.dev", 
    "acredocs": "//release.acredocs.stefanomazzocchi.user.dev", 
    "datadocs": "//release.datadocs.dfhuynh.user.dev", 
    "jscheatsheet": "//release.jscheatsheet.stefanomazzocchi.user.dev"
  }, 
  "app_tag": "1a"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);