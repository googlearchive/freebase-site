var METADATA = {
  "mounts": {
    "lib": "//18a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 6, 
  "app_tag": "6b", 
  "app_key": "data"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);