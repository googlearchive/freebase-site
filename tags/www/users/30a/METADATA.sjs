var METADATA = {
  "mounts": {
    "lib": "//79e.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "30", 
  "app_tag": "30a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
