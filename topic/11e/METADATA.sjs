var METADATA = {
  "mounts": {
    "lib": "//17a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 11, 
  "app_tag": "11e", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);