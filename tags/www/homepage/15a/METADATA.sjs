var METADATA = {
  "mounts": {
    "lib": "//22a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 15, 
  "app_tag": "15a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);