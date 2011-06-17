var METADATA = {
  "mounts": {
    "lib": "//17a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 10, 
  "app_tag": "10b", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);