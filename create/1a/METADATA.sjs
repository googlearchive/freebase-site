var METADATA = {
  "mounts": {
    "lib": "//13.lib.www.branches.svn.freebase-site.googlecode.dev"
  }, 
  "app_tag": null, 
  "app_version": 1, 
  "app_key": "create"
};

acre.require(METADATA.mounts.lib + "/loader.sjs").extend_metadata(METADATA);