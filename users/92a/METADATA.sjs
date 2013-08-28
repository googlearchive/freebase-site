var METADATA = {
  "mounts": {
    "lib": "//142a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "92", 
  "app_tag": "92a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
