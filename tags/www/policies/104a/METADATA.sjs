var METADATA = {
  "mounts": {
    "lib": "//131a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "104", 
  "app_tag": "104a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
