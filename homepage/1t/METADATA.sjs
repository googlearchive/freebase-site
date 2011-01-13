var METADATA = {
  "mounts": {
    "lib": "//1f.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "1", 
  "app_tag": "1t", 
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
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);