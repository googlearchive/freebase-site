var METADATA = {
  "mounts": {
    "lib": "//90a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "40", 
  "app_tag": "40a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
