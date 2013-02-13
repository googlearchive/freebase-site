var METADATA = {
  "mounts": {
    "lib": "//107a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "77", 
  "app_tag": "77a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
