var METADATA = {
  "mounts": {
    "lib": "//15a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 9, 
  "app_tag": "9a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);