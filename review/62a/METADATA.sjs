var METADATA = {
  "mounts": {
    "lib": "//110a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "62", 
  "app_tag": "62a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
