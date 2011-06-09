var METADATA = {
  "mounts": {
    "lib": "//13b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 8, 
  "app_tag": "8b", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);