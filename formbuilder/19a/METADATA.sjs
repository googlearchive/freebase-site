var METADATA = {
  "app_tag": "19a", 
  "app_key": "formbuilder", 
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
    "lib": "//102a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "19"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
