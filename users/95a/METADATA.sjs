var METADATA = {
  "mounts": {
    "lib": "//145a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "95", 
  "app_tag": "95a", 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
