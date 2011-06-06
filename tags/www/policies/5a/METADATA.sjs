var METADATA = {
  "mounts": {
    "lib": "//13a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 5, 
  "app_tag": "5a", 
  "app_key": "policies"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);