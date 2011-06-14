var METADATA = {
  "mounts": {
    "lib": "//14d.lib.www.tags.svn.freebase-site.googlecode.dev"
  }, 
  "app_version": 6, 
  "app_tag": "6b", 
  "app_key": "apps"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);