var METADATA = {
  "mounts": {
    "lib": "//17.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 6, 
  "app_key": "group"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);