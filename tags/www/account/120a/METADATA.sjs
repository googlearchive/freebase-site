var METADATA = {
  "mounts": {
    "lib": "//147a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "120", 
  "app_tag": "120a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
