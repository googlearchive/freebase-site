var METADATA = {
  "mounts": {
    "lib": "//22.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 15, 
  "app_key": "homepage"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);