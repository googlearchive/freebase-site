var METADATA = {
  "mounts": {
    "lib": "//83a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "34", 
  "app_tag": "34a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
