var METADATA = {
  "app_version": "2", 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_key": "schema", 
  "extensions": {
    "mf.js": {
      "handler": "tagged_static"
    }, 
    "png": {
      "handler": "tagged_static"
    }, 
    "gif": {
      "handler": "tagged_static"
    }, 
    "mf.css": {
      "handler": "tagged_static"
    }, 
    "jpg": {
      "handler": "tagged_static"
    }
  }, 
  "ttl": -1, 
  "mounts": {
    "lib": "//2l.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "2b"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);