var METADATA = {
  "mounts": {
    "lib": "//123a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "73", 
  "app_tag": "73a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
