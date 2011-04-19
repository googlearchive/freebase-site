var METADATA = {
  "mounts": {
    "lib": "//11b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "6a", 
  "app_version": 6, 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);