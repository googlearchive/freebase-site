var METADATA = {
  "mounts": {
    "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "44", 
  "app_tag": "44a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
