var METADATA = {
  "mounts": {
    "lib": "//148a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "98", 
  "app_tag": "98a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
