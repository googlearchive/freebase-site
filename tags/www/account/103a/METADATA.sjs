var METADATA = {
  "mounts": {
    "lib": "//130.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "103", 
  "app_tag": "103a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
