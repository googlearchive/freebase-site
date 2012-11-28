var METADATA = {
  "mounts": {
    "lib": "//94a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "67", 
  "app_tag": "67a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
