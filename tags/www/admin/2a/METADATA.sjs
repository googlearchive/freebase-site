var METADATA = {
  "mounts": {
    "lib": "//14c.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 2, 
  "app_tag": "2a", 
  "app_key": "admin"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);