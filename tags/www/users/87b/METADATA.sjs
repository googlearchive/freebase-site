var METADATA = {
  "mounts": {
    "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "87", 
  "app_tag": "87b", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
