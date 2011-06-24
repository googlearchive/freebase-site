var METADATA = {
  "mounts": {
    "lib": "//19a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 7, 
  "app_tag": "7a", 
  "app_key": "query"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);