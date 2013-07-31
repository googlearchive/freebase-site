var METADATA = {
  "mounts": {
    "lib": "//140a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "92", 
  "app_tag": "92a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
