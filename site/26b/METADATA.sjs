var METADATA = {
  "app_version": "26", 
  "app_key": "site", 
  "project": "freebase-site.googlecode.dev", 
  "extensions": {
    "mf.css": {
      "media_type": "text/css", 
      "handler": "css_manifest"
    }, 
    "mf.js": {
      "media_type": "text/javascript", 
      "handler": "js_manifest"
    }, 
    "omf.css": {
      "media_type": "text/css", 
      "handler": "css_manifest"
    }, 
    "omf.js": {
      "media_type": "text/javascript", 
      "handler": "js_manifest"
    }
  }, 
  "mounts": {
    "lib": "//55a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "26b"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
