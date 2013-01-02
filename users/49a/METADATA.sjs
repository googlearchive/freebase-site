var METADATA = {
  "mounts": {
    "lib": "//99b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "49", 
  "app_tag": "49a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
