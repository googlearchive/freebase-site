var METADATA = {
  "mounts": {
    "lib": "//137a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "87", 
  "app_tag": "87a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
