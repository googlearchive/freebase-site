var METADATA = {
  "mounts": {
    "lib": "//23b.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 5, 
  "app_tag": "5a", 
  "app_key": "history"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);