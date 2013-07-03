var METADATA = {
  "mounts": {
    "lib": "//137b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "89", 
  "app_tag": "89b", 
  "app_key": "review"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
