var METADATA = {
  "mounts": {
    "lib": "//104a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "77", 
  "app_tag": "77a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
