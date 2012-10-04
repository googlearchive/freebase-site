var METADATA = {
  "mounts": {
    "lib": "//87a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "38", 
  "app_tag": "38a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
