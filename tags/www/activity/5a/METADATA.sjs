var METADATA = {
  "mounts": {
    "lib": "//17.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 5, 
  "app_key": "activity"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);