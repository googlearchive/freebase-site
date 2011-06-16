var METADATA = {
  "mounts": {
    "lib": "//16a.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 6, 
  "app_tag": "6a", 
  "app_key": "account"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);