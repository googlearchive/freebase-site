var METADATA = {
  "mounts": {
    "lib": "//22a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "16a", 
  "app_version": 16, 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);