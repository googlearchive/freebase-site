var METADATA = {
  "mounts": {
    "lib": "//20a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 8, 
  "app_tag": "8a", 
  "app_key": "activity"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);