var METADATA = {
  "mounts": {
    "site": "//26b.site.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": "30b", 
  "app_version": "30", 
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
  "app_key": "appeditor"
};

acre.require(METADATA.mounts.site + "/lib/helper/helpers.sjs").extend_metadata(METADATA, "site");
