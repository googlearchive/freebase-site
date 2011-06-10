var METADATA = {
  "mounts": {
    "lib": "//14.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 2, 
  "app_key": "admin"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);