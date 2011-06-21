var METADATA = {
  "mounts": {
    "lib": "//18a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 11, 
  "app_tag": "11a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);