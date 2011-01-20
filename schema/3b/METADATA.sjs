var METADATA = {
  "mounts": {
    "lib": "//3b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "3b", 
  "app_version": "3", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);