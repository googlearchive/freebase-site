var METADATA = {
  "mounts": {
    "lib": "//95a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "47", 
  "app_tag": "47a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
