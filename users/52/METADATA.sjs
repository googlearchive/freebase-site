var METADATA = {
  "mounts": {
    "lib": "//102.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 52, 
  "app_key": "users"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
