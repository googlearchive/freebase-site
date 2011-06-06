var METADATA = {
  "mounts": {
    "lib": "//13a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 3, 
  "app_tag": "3a", 
  "app_key": "group"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);