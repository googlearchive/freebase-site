var METADATA = {
  "mounts": {
    "lib": "//78b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "7", 
  "app_tag": "7b", 
  "app_key": "discuss"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
