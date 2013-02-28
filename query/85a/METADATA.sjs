var METADATA = {
  "mounts": {
    "lib": "//115a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": "85", 
  "app_tag": "85a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/helper/helpers.sjs").extend_metadata(METADATA, "lib");
