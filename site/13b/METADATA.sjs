var METADATA = {
  "app_version": "13", 
  "app_key": "site", 
  "project": "freebase-site.googlecode.dev", 
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
  "ttl": -1, 
  "mounts": {
    "lib": "//31a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "13b"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");