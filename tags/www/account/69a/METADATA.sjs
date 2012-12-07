var METADATA = {
  "mounts": {
    "lib": "//96a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "69", 
  "app_tag": "69a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
