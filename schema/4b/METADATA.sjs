var METADATA = {
  "mounts": {
    "lib": "//5d.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "freebase": {
    "write_user": "appeditoruser"
  }, 
  "app_tag": "4b", 
  "app_version": "4", 
  "app_key": "schema"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);