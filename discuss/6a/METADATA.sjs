var METADATA = {
  "mounts": {
    "lib": "//77a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "6", 
  "app_tag": "6a", 
  "app_key": "discuss"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
