var METADATA = {
  "mounts": {
    "lib": "//150a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "123", 
  "app_tag": "123a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
