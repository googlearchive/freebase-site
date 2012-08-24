var METADATA = {
  "mounts": {
    "lib": "//79e.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "8", 
  "app_tag": "8a", 
  "app_key": "discuss"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
