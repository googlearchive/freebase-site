var METADATA = {
  "mounts": {
    "lib": "//125.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "98", 
  "app_tag": "98a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
