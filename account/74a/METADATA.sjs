var METADATA = {
  "mounts": {
    "lib": "//101a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "74", 
  "app_tag": "74a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
