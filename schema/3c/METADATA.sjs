var METADATA = {
  "app_version": "3", 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_key": "schema", 
  "extensions": {
    "gif": {
      "media_type": "image/gif", 
      "handler": "tagged_static"
    }, 
    "mf.css": {
      "media_type": "text/css", 
      "handler": "tagged_static"
    }, 
    "jpg": {
      "media_type": "image/jpg", 
      "handler": "tagged_static"
    }, 
    "omf.js": {
      "media_type": "text/js", 
      "handler": "js_manifest"
    }, 
    "mf.js": {
      "media_type": "text/js", 
      "handler": "tagged_static"
    }, 
    "omf.css": {
      "media_type": "text/css", 
      "handler": "css_manifest"
    }, 
    "png": {
      "media_type": "image/png", 
      "handler": "tagged_static"
    }
  }, 
  "ttl": -1, 
  "mounts": {
    "lib": "//3c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "3c"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);