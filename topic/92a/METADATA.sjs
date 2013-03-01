var METADATA = {
  "mounts": {
    "lib": "//116a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "92", 
  "app_tag": "92a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
