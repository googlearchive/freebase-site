var METADATA = {
  "mounts": {
    "lib": "//105b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "55", 
  "app_tag": "55a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
