var METADATA = {
  "mounts": {
    "lib": "//18a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 5, 
  "app_tag": "5b", 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);