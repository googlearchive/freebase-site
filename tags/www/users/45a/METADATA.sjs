var METADATA = {
  "mounts": {
    "lib": "//95a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "45", 
  "app_tag": "45a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
