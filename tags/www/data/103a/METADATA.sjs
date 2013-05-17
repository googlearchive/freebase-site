var METADATA = {
  "mounts": {
    "lib": "//132a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "103", 
  "app_tag": "103a", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
