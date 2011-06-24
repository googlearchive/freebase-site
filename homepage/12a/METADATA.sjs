var METADATA = {
  "mounts": {
    "lib": "//19a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 12, 
  "app_tag": "12a", 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);