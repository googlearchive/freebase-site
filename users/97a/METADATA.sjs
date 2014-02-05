var METADATA = {
  "mounts": {
    "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "97", 
  "app_tag": "97a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
