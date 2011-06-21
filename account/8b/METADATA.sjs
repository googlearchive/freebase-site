var METADATA = {
  "mounts": {
    "lib": "//18a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 8, 
  "app_tag": "8b", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);