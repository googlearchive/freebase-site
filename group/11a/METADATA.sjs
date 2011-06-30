var METADATA = {
  "mounts": {
    "lib": "//22a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 11, 
  "app_tag": "11a", 
  "app_key": "group"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);