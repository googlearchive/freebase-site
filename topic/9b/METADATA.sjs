var METADATA = {
  "mounts": {
    "lib": "//14d.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 9, 
  "app_tag": "9b", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);