var METADATA = {
  "mounts": {
    "lib": "//107a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "59", 
  "app_tag": "59a", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
