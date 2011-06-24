var METADATA = {
  "mounts": {
    "lib": "//19a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 13, 
  "app_tag": "13a", 
  "app_key": "topic"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);